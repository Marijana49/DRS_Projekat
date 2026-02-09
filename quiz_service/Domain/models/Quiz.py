from Database.InitializationDB import db
from Domain.enums.QuizStatus import QuizStatus

class Quiz(db.Model):
    __tablename__ = "quizes"

    id = db.Column(db.Integer, primary_key = True)
    quiz_name = db.Column(db.String(20), nullable = False)
    questions = db.Column(db.JSON, nullable = False)
    answers = db.Column(db.JSON, nullable = False)
    points = db.Column(db.JSON, nullable = False)
    correct_answers = db.Column(db.JSON, nullable = False)
    duration = db.Column(db.Integer, nullable=False)
    author = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Integer, nullable = False, default = QuizStatus.Pending.value)
    reject_reason = db.Column(db.String(255), nullable=True)