from Database.InitializationDB import db
from Domain.enums.Gender import Gender
from Domain.enums.UserRole import UserRole


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key = True)
    first_name = db.Column(db.String(20), nullable = False)
    last_name = db.Column(db.String(20), nullable = False)
    email = db.Column(db.String(50), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)
    birth_date = db.Column(db.Date, nullable = False)
    country = db.Column(db.String(30), nullable = False)
    street = db.Column(db.String(30), nullable = False)
    street_number = db.Column(db.String(10), nullable = False)
    gender = db.Column(db.Integer, nullable = False, default = Gender.Male.value)
    role = db.Column(db.Integer, nullable = False, default = UserRole.PLAYER.value)
    failed_attempts = db.Column(db.Integer, nullable=False, default=0)
    blocked_until = db.Column(db.DateTime, nullable=True, default=None)
    profile_image = db.Column(db.String(255), nullable=True, default=None)
