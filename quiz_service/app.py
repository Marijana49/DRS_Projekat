import os
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send
from flask import make_response
from threading import Thread
import time
import requests
from flask_caching import Cache
from Database.InitializationDB import db
from Domain.models.Quiz import Quiz
from Domain.models.QuizResults import QuizResult
from Domain.enums.QuizStatus import QuizStatus
from flask_mail import Mail, Message
from dotenv import load_dotenv
from Service.email_process import start_email_process
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO # za sve ovo ide: pip install reportlab


load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r'/*': {"origins": "http://localhost:5005"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:1234@localhost:3306/quiz_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config["JWT_SECRET_KEY"] = "tajna"

app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT"))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS") == "true"
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER")
mail = Mail(app)

cache = Cache(config={"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 300})
cache.init_app(app)

db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5005")

with app.app_context():
    db.create_all()


def get_quiz_cache_key(role, email=None):
    if role == 3:
        return "quizzes:role:admin"
    elif role == 2 and email:
        return f"quizzes:moderator:{email}"
    else:
        return "quizzes:role:player"


@app.route("/quiz", methods=["POST", "GET"])
@jwt_required(optional=True)
def quizzes():
    claims = get_jwt()
    if request.method == "GET":
     
        cache_key = get_quiz_cache_key(claims.get('role'), claims.get('email'))
        cached_quizzes = cache.get(cache_key)
        if cached_quizzes:
            return jsonify(cached_quizzes)
        
        if(claims.get("role") == 3):
            quizzes = Quiz.query.all()
        elif(claims.get("role") == 2):
            quizzes = Quiz.query.filter_by(author=claims.get("email")).all()
        else:
            quizzes = Quiz.query.filter_by(status=QuizStatus.Approved.value).all()

        result = [
            {"quizId": q.id, "quizName": q.quiz_name, "quizDuration": q.duration, "quizAuthor": q.author, "quizStatus": q.status}
            for q in quizzes
        ]
    
        cache.set(cache_key, result)
        return jsonify(result)

    if not claims or claims.get("role") != 2:
        return jsonify({"message": "Unauthorized", "success": False}), 403
    

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

    cache.delete(get_quiz_cache_key(2, claims["email"]))
    cache.delete(get_quiz_cache_key(3))
   

    socketio.emit("new_quiz", {
        "quizId": quiz.id,
        "quizName": quiz.quiz_name,
        "quizAuthor": quiz.author,
        "quizDuration": quiz.duration,
        "quizStatus": quiz.status
    })

    return jsonify({"message": "Quiz sent for approval", "success": True, "data": quiz.id}), 201


@app.route("/admin/quiz/<int:quiz_id>/approve", methods=["PUT"])
@jwt_required()
def approve_quiz(quiz_id):
    claims = get_jwt()
    if claims.get("role") != 3:
        return jsonify({"message": "Unauthorized"}), 403

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    quiz.status = QuizStatus.Approved.value
    quiz.reject_reason = None
    db.session.commit()

    cache.delete(get_quiz_cache_key(2, quiz.author))
    cache.delete(get_quiz_cache_key(3))
   

    socketio.emit("quiz_approved", {
        "id": quiz.id,
        "quizName": quiz.quiz_name,
        "duration": quiz.duration,
        "author": quiz.author
        
    })
    socketio.emit("accept", {"message": "APPROVED - you can leave the page"})

    return jsonify({"message": "Quiz approved", "success": True})


@app.route("/admin/quiz/<int:quiz_id>/reject", methods=["PUT"])
@jwt_required()
def reject_quiz(quiz_id):
    claims = get_jwt()
    if claims.get("role") != 3:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    quiz.status = QuizStatus.Rejected.value
    quiz.reject_reason = data.get("reason")
    db.session.commit()

    cache.delete(get_quiz_cache_key(2, quiz.author))
    cache.delete(get_quiz_cache_key(3))
    

    socketio.emit("reject", {"message": "REJECTED - " + quiz.reject_reason})

    return jsonify({"message": "Quiz rejected", "success": True})


@app.route("/quiz/<int:quiz_id>/delete", methods=["DELETE"])
@jwt_required()
def delete_quiz(quiz_id):
    claims = get_jwt()
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not available", "success": False}), 404
    

    if not claims or (claims.get("role") != 2 and quiz.author != claims.get("email")) and claims.get("role") != 3: 
        return jsonify({"message": "Unathorized", "success": False}), 403

    author_email = quiz.author  

    db.session.delete(quiz)
    db.session.commit()

    cache.delete(get_quiz_cache_key(2, author_email))
    cache.delete(get_quiz_cache_key(3))
   

    return jsonify({"message": "Delete successful", "success": True}), 200

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

   
    cache.delete(get_quiz_cache_key(2, quiz.author))
    cache.delete(get_quiz_cache_key(3))
   

    socketio.emit("new_quiz", {
        "quizId": quiz.id,
        "quizName": quiz.quiz_name,
        "quizAuthor": quiz.author,
        "quizDuration": quiz.duration,
        "quizStatus": quiz.status
    })

    return jsonify({"message": "Quiz updated and sent for approval"})


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


@app.route("/quiz/<int:quiz_id>/start", methods=["GET"])
@jwt_required()
def start_quiz(quiz_id):
    cache_key = f"quiz:{quiz_id}:start"
    cached_quiz = cache.get(cache_key)
    if cached_quiz:
        return jsonify(cached_quiz)
    
    quiz = Quiz.query.get(quiz_id)
    if not quiz or quiz.status != QuizStatus.Approved.value:
        return jsonify({"message": "Quiz not available"}), 403

    result = {
        "id": quiz.id,
        "quizName": quiz.quiz_name,
        "questions": quiz.questions,
        "answers": quiz.answers,
        "points": quiz.points,
        "correctAnswers": quiz.correct_answers,
        "duration": quiz.duration,
        "author": quiz.author
    }
    cache.set(cache_key, result)
    return jsonify(result)



@app.route("/quiz/<int:quiz_id>/edit", methods=["GET"])
@jwt_required()
def edit_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not available"}), 403

    result = {
        "id": quiz.id,
        "quizName": quiz.quiz_name,
        "questions": quiz.questions,
        "answers": quiz.answers,
        "points": quiz.points,
        "correctAnswers": quiz.correct_answers,
        "duration": quiz.duration,
        "author": quiz.author
    }

    return jsonify(result)

@app.route("/quiz/<int:quiz_id>/ranking", methods=["GET"])
def quiz_ranking(quiz_id):
    results = QuizResult.query \
        .filter_by(quiz_id=quiz_id) \
        .order_by(QuizResult.points.desc()) \
        .all()

    return jsonify([
        {"playerId": r.player_name, "points": r.points, "spentTime": r.spent_time}
        for r in results
    ])

@app.route("/admin/quiz/<int:quiz_id>/results/pdf", methods=["POST"])
@jwt_required()
def generate_results_pdf(quiz_id):
    claims = get_jwt()

    if claims.get("role") != 3:
        return jsonify({"message": "Unauthorized"}), 403

    admin_email = claims.get("email")

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    results = QuizResult.query \
        .filter_by(quiz_id=quiz_id) \
        .order_by(QuizResult.points.desc()) \
        .all()

    if not results:
        return jsonify({"message": "No results for this quiz"}), 400

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, f"Quiz Results Report")
    y -= 30

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, y, f"Quiz: {quiz.quiz_name}")
    y -= 20
    pdf.drawString(50, y, f"Author: {quiz.author}")
    y -= 20
    pdf.drawString(50, y, f"Generated by admin: {admin_email}")
    y -= 40

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "Player")
    pdf.drawString(250, y, "Time (sec)")
    pdf.drawString(400, y, "Points")
    y -= 20

    pdf.setFont("Helvetica", 11)

    for r in results:
        if y < 50:
            pdf.showPage()
            y = height - 50

        pdf.drawString(50, y, str(r.player_name))
        pdf.drawString(250, y, str(r.spent_time))
        pdf.drawString(400, y, str(r.points))
        y -= 18

    pdf.save()
    buffer.seek(0)

    msg = Message(
        subject=f"PDF Report - {quiz.quiz_name}",
        recipients=[admin_email],
        body=f"Attached is the PDF report for quiz: {quiz.quiz_name}"
    )

    msg.attach(
        filename=f"{quiz.quiz_name}_results.pdf",
        content_type="application/pdf",
        data=buffer.read()
    )

    try:
        mail.send(msg)
    except Exception as e:
        print("MAIL ERROR:", e)
        return jsonify({"message": "Failed to send email"}), 500

    return jsonify({"message": "PDF generated and sent to admin email successfully"}), 200


@app.route("/quiz/<int:quiz_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz(quiz_id):
    claims = get_jwt()
    data = request.json

    quiz = Quiz.query.get(quiz_id)
    if not quiz or quiz.status != QuizStatus.Approved.value:
        return jsonify({"message": "Quiz not available", "success": False}), 403

    user_email = claims.get("email")
    user_answers = data.get("answers")
    spent_time = data.get("spentTime")

    total_points = 0

    for i in range(len(quiz.correct_answers)):
        if i < len(user_answers) and user_answers[i] == quiz.correct_answers[i]:
            total_points += quiz.points[i]

    result = QuizResult(
        quiz_id=quiz.id,
        player_name=user_email,
        points=total_points,
        spent_time=spent_time
    )

    db.session.add(result)
    db.session.commit()

    subject = "Quiz Results"

    body = f"""
    Quiz: {quiz.quiz_name}

    Your score: {total_points}
    Time spent: {spent_time} seconds

    Thank you for playing!
    """

    try:
        start_email_process(user_email, subject, body)

    except Exception as e:
        print("Email error:", e)

    cache.delete(f"quiz:{quiz_id}:ranking")

    return jsonify({
        "success": True,
        "message": "Quiz submitted successfully",
        "points": total_points
    })


@socketio.on("connect")
def handle_connect():
    print("Admin connected to WebSocket")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Tables created!")
    socketio.run(app, port=5001, host="0.0.0.0", allow_unsafe_werkzeug=True)