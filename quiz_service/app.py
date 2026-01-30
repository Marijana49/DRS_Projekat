from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity, get_jwt
)
from flask_cors import CORS
from flask_socketio import SocketIO
from threading import Thread
import time
import requests

from Database.InitializationDB import db
from Domain.models.Quiz import Quiz
from Domain.models.QuizResults import QuizResult

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:1234@localhost:3306/quiz_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config["JWT_SECRET_KEY"] = "tajna"

db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173"])

with app.app_context():
    db.create_all()


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_response("")
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


@app.route("/quiz", methods=["POST", "OPTIONS"])
def create_quiz():
    if request.method == "OPTIONS":
        return '', 200  

    @jwt_required()
    def inner():
        claims = get_jwt()
        if claims["role"] != "MODERATOR":
            return jsonify({"message": "Unauthorized"}), 403

        data = request.json
        quiz = Quiz(
            quiz_name=data["quizName"],
            questions=data["questions"],
            answers=data["answers"],
            correct_answers=data["correctAnswers"],
            question_points=data["questionPoints"],
            duration=data["duration"],
            author=claims["email"],
            status="PENDING"
        )

        db.session.add(quiz)
        db.session.commit()

        socketio.emit("new_quiz", {
            "quizId": quiz.id,
            "quizName": quiz.quiz_name,
            "author": quiz.author
        })

        return jsonify({"message": "Quiz sent for approval"}), 201

    return inner()


@app.route("/admin/quiz/<int:quiz_id>/approve", methods=["PUT", "OPTIONS"])
def approve_quiz(quiz_id):
    if request.method == "OPTIONS":
        return '', 200

    @jwt_required()
    def inner():
        claims = get_jwt()
        if claims["role"] != "ADMINISTRATOR":
            return jsonify({"message": "Unauthorized"}), 403

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        quiz.status = "APPROVED"
        quiz.reject_reason = None
        db.session.commit()

        socketio.emit("quiz_approved", {
            "id": quiz.id,
            "quizName": quiz.quiz_name,
            "duration": quiz.duration,
            "author": quiz.author
        })

        return jsonify({"message": "Quiz approved"})

    return inner()


@app.route("/admin/quiz/<int:quiz_id>/reject", methods=["PUT", "OPTIONS"])
def reject_quiz(quiz_id):
    if request.method == "OPTIONS":
        return '', 200

    @jwt_required()
    def inner():
        claims = get_jwt()
        if claims["role"] != "ADMINISTRATOR":
            return jsonify({"message": "Unauthorized"}), 403

        data = request.json
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        quiz.status = "REJECTED"
        quiz.reject_reason = data["reason"]
        db.session.commit()

        return jsonify({"message": "Quiz rejected"})

    return inner()


@app.route("/quiz", methods=["GET", "OPTIONS"])
def get_quizzes():
    if request.method == "OPTIONS":
        return '', 200

    @jwt_required()
    def inner():
        quizzes = Quiz.query.filter_by(status="APPROVED").all()
        return jsonify([
            {"id": q.id, "quizName": q.quiz_name, "duration": q.duration, "author": q.author}
            for q in quizzes
        ])

    return inner()


@app.route("/quiz/<int:quiz_id>/start", methods=["POST", "OPTIONS"])
def start_quiz(quiz_id):
    if request.method == "OPTIONS":
        return '', 200

    @jwt_required()
    def inner():
        quiz = Quiz.query.get(quiz_id)
        if not quiz or quiz.status != "APPROVED":
            return jsonify({"message": "Quiz not available"}), 403

        return jsonify({
            "quizId": quiz.id,
            "questions": quiz.questions,
            "answers": quiz.answers,
            "duration": quiz.duration
        })

    return inner()


def process_quiz_async(quiz, user_answers, player_id, spent_time, player_email):
    time.sleep(5)
    total_points = 0
    for i, correct in enumerate(quiz.correct_answers):
        if set(correct) == set(user_answers[i]):
            total_points += quiz.question_points[i]

    result = QuizResult(
        quiz_id=quiz.id,
        player_id=player_id,
        spent_time=spent_time,
        points=total_points
    )

    db.session.add(result)
    db.session.commit()

    requests.post(
        "http://localhost:5000/email",
        json={
            "to": player_email,
            "subject": "Quiz result",
            "body": f"You scored {total_points} points."
        }
    )


@app.route("/quiz/<int:quiz_id>/submit", methods=["POST", "OPTIONS"])
def submit_quiz(quiz_id):
    if request.method == "OPTIONS":
        return '', 200

    @jwt_required()
    def inner():
        data = request.json
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        claims = get_jwt()
        player_id = get_jwt_identity()
        player_email = claims["email"]

        thread = Thread(
            target=process_quiz_async,
            args=(quiz, data["answers"], player_id, data["spentTime"], player_email)
        )
        thread.start()

        return jsonify({"message": "Quiz is being processed"})

    return inner()


@app.route("/quiz/<int:quiz_id>/ranking", methods=["GET", "OPTIONS"])
def quiz_ranking(quiz_id):
    if request.method == "OPTIONS":
        return '', 200

    results = QuizResult.query \
        .filter_by(quiz_id=quiz_id) \
        .order_by(QuizResult.points.desc()) \
        .all()

    return jsonify([
        {"playerId": r.player_id, "points": r.points, "spentTime": r.spent_time}
        for r in results
    ])


@socketio.on("connect")
def handle_connect():
    print("Admin connected to WebSocket")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Tables created!")
    socketio.run(app, debug=True)
