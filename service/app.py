from flask import Flask
from Database.InitializationDB import db
from Domain.models.User import User

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:1234@localhost:3306/users_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['SQLALCHEMY_ECHO'] = True

db.init_app(app)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Tabele kreirane!")

    app.run(debug=True)