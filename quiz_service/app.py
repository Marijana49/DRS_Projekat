from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send
from flask import make_response
from threading import Thread
import time
import requests

from Database.InitializationDB import db
from Domain.models.Quiz import Quiz
from Domain.models.QuizResults import QuizResult
from Domain.enums.QuizStatus import QuizStatus

app = Flask(__name__)

CORS(
    app,
    resources={r'/*': {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:1234@localhost:3306/quiz_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config["JWT_SECRET_KEY"] = "tajna"

db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

with app.app_context():
    db.create_all()


@app.route("/quiz", methods=["POST", "GET"])
@jwt_required(optional=True)
def quizzes():
    claims = get_jwt()
    if request.method == "GET":
        if(claims.get("role") == 3):
            quizzes = Quiz.query.all()
        elif(claims.get("role") == 2):
            quizzes = Quiz.query.filter_by(author=claims.get("email")).all()
        else:
            quizzes = Quiz.query.filter_by(status=QuizStatus.Approved.value).all()
        return jsonify([
            {"quizId": q.id, "quizName": q.quiz_name, "quizDuration": q.duration, "quizAuthor": q.author, "quizStatus": q.status}
            for q in quizzes
        ])

    if not claims or claims.get("role") != 2:
        return jsonify({"message": "Unauthorized"}), 403
    

    data = request.json
    quiz = Quiz(
        quiz_name=data["quizName"],
        questions=data["questions"],
        answers=data["answers"],
        points=data["points"],
        correct_answers=data["correctAnswers"],
        duration=data["duration"],
        author=claims["email"],
        status=QuizStatus.Pending.value
    )

    db.session.add(quiz)
    db.session.commit()

    socketio.emit("new_quiz", {
        "quizId": quiz.id,
        "quizName": quiz.quiz_name,
        "quizAuthor": quiz.author,
        "quizDuration": quiz.duration,
        "quizStatus": quiz.status
    })

    return jsonify({"message": "Quiz sent for approval"}), 201

@app.route("/admin/quiz/<int:quiz_id>/approve", methods=["PUT"])
@jwt_required()
def approve_quiz(quiz_id):
    claims = get_jwt()
    if claims.get("role") != 3:
        return jsonify({"message": "Unauthorized"}), 403

    #return jsonify({"message": "Quiz approved", "success": True}), 200

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    quiz.status = QuizStatus.Approved.value
    quiz.reject_reason = None
    db.session.commit()

    socketio.emit("quiz_approved", {
        "id": quiz.id,
        "quizName": quiz.quiz_name,
        "duration": quiz.duration,
        "author": quiz.author
        
    })

    return jsonify({"message": "Quiz approved", "success": True})

@app.route("/admin/quiz/<int:quiz_id>/reject", methods=["PUT"])
@jwt_required()
def reject_quiz(quiz_id):
    claims = get_jwt()
    if claims.get("role") != 3:
        return jsonify({"message": "Unauthorized"}), 403

    # return jsonify({"message": "Quiz rejected", "success": True}), 200

    data = request.json
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    quiz.status = QuizStatus.Rejected.value
    quiz.reject_reason = data.get("reason")
    db.session.commit()

    return jsonify({"message": "Quiz rejected", "success": True})

@app.route("/admin/quizes/pending", methods=["GET"])
@jwt_required()
def get_pending_quizes():
    claims = get_jwt()
    if claims.get("role") != 3:
        return jsonify({"message": "Unauthorized"}), 403

    quizzes = Quiz.query.filter_by(status=QuizStatus.Pending.value).all()

    return jsonify([
        {
            "quizId": q.id,
            "quizName": q.quiz_name,
            "quizAuthor": q.author,
            "quizDuration": q.duration,
            "quizStatus": q.status
        }
        for q in quizzes
    ])

@app.route("/admin/quiz/pending/<int:quiz_id>", methods=["GET"])
@jwt_required()
def get_pending_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz or quiz.status != QuizStatus.Pending.value:
        return jsonify({"message": "Quiz not available"}), 403

    return jsonify({
        "id": quiz.id,
        "quizName": quiz.quiz_name,
        "questions": quiz.questions,
        "answers": quiz.answers,
        "points": quiz.points,
        "correctAnswers": quiz.correct_answers,
        "duration": quiz.duration,
        "author": quiz.author
    })


@app.route("/moderator/quizes", methods=["GET"])
@jwt_required()
def get_moderator_quizes():
    claims = get_jwt()
    if claims.get("role") != 2:   
        return jsonify({"message": "Unauthorized"}), 403

    email = claims.get("email")

    quizzes = Quiz.query.filter_by(author=email).all()

    return jsonify([
        {
            "id": q.id,
            "quizName": q.quiz_name,
            "questions": q.questions,
            "answers": q.answers,
            "points": q.points,
            "correctAnswers": q.correct_answers,
            "duration": q.duration,
            "author": q.author,
            "status": q.status,
            "rejectReason": q.reject_reason
        }
        for q in quizzes
    ])

@app.route("/moderator/quiz/<int:quiz_id>", methods=["PUT"])
@jwt_required()
def update_quiz(quiz_id):
    claims = get_jwt()
    if claims.get("role") != 2:
        return jsonify({"message": "Unauthorized"}), 403

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    if quiz.author != claims.get("email"):
        return jsonify({"message": "Forbidden"}), 403

    data = request.json

    quiz.quiz_name = data["quizName"]
    quiz.questions = data["questions"]
    quiz.answers = data["answers"]
    quiz.points = data["points"]
    quiz.correct_answers = data["correctAnswers"]
    quiz.duration = data["duration"]

    quiz.status = QuizStatus.Pending.value
    quiz.reject_reason = None

    db.session.commit()

    socketio.emit("new_quiz", {
        "quizId": quiz.id,
        "quizName": quiz.quiz_name,
        "quizAuthor": quiz.author,
        "quizDuration": quiz.duration,
        "quizStatus": quiz.status
    })

    return jsonify({"message": "Quiz updated and sent for approval"})


@app.route("/quiz/<int:quiz_id>/start", methods=["GET"])
@jwt_required()
def start_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz or quiz.status != QuizStatus.Approved.value:
        return jsonify({"message": "Quiz not available"}), 403

    return jsonify({
        "id": quiz.id,
        "quizName": quiz.quiz_name,
        "questions": quiz.questions,
        "answers": quiz.answers,
        "points": quiz.points,
        "correctAnswers": quiz.correct_answers,
        "duration": quiz.duration,
        "author": quiz.author
    })

def process_quiz_async(quiz, user_answers, player_id, spent_time, player_email):
    time.sleep(5)
    total_points = 0
    for i, correct in enumerate(quiz.correct_answers):
        if user_answers[i] == correct:
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

@app.route("/quiz/<int:quiz_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz(quiz_id):
    data = request.json
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    claims = get_jwt()
    player_id = get_jwt_identity()
    player_email = claims.get("email")

    thread = Thread(
        target=process_quiz_async,
        args=(quiz, data["answers"], player_id, data["spentTime"], player_email)
    )
    thread.start()

    return jsonify({"message": "Quiz is being processed"})

@app.route("/quiz/<int:quiz_id>/ranking", methods=["GET"])
def quiz_ranking(quiz_id):
    results = QuizResult.query \
        .filter_by(quiz_id=quiz_id) \
        .order_by(QuizResult.points.desc()) \
        .all()

    return jsonify([
        {"playerId": r.player_id, "points": r.points, "spentTime": r.spent_time}
        for r in results
    ])

@app.route("/quiz/<int:quiz_id>/delete", methods=["DELETE"])
@jwt_required()
def delete_quiz(quiz_id):
    claims = get_jwt()
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not available", "success": False}), 404
    

    if not claims or (claims.get("role") != 2 and quiz.author != claims.get("email")) and claims.get("role") != 3: 
        return jsonify({"message": "Unathorized", "success": False}), 403

    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"message": "Delete successful", "success": True}), 200

@socketio.on("connect")
def handle_connect():
    print("Admin connected to WebSocket")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Tables created!")
    socketio.run(app, debug=True, port=5001)
