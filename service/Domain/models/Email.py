from datetime import datetime
from Database.InitializationDB import db

class Email(db.Model):
    __tablename__ = "emails"

    id = db.Column(db.Integer, primary_key=True)
    to = db.Column(db.String(120))
    subject = db.Column(db.String(200))
    body = db.Column(db.Text)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)