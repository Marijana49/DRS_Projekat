from Database.InitializationDB import db

class QuizResult(db.Model):
    __tablename__ = "quiz_results"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, nullable=False)
    player_name = db.Column(db.String(20), nullable=False)
    spent_time = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=False)
