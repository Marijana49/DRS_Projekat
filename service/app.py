import os
from flask import Flask, jsonify, request, send_file
from Database.InitializationDB import db
from Domain.models.User import User
from Domain.models.Email import Email
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from Domain.enums.UserRole import UserRole
from Domain.enums.Gender import Gender
from flask_cors import CORS
from flask_caching import Cache
from flask_mail import Mail
from dotenv import load_dotenv
from Services.email_process import start_email_process

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, expose_headers=["Authorization"], allow_headers=["Content-Type", "Authorization"])

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:1234@localhost:3306/users_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config["JWT_SECRET_KEY"] = "tajna"
# app.config["JWT_TOKEN_LOCATION"] = "headers"

app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT"))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS") == "true"
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER")
mail = Mail(app)

jwt = JWTManager(app)

cache = Cache(config={"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 300})
cache.init_app(app)

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400
    
    gender_str = data.get("gender", "")
    if gender_str not in Gender.__members__:
        return jsonify({"message": "Error gender"}), 400

    if not isinstance(data.get("street_number"), int):
        return jsonify({"message": "Street number has to be a number"}), 400

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        birth_date=datetime.strptime(data["birth_date"], "%Y-%m-%d").date(),
        gender = Gender[gender_str].value,
        country=data["country"],
        street=data["street"],
        street_number=data["street_number"],
        role=UserRole.PLAYER.value
    )

    db.session.add(user)
    db.session.commit()

    cache.delete("users:all")

    return jsonify({"message": "User registered"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"message": "Wrong credentials"}), 401

    if user.blocked_until and user.blocked_until > datetime.now():
        return jsonify({"message": "Your account is temporarily blocked"}), 403

    if not check_password_hash(user.password, data["password"]):
        user.failed_attempts += 1

        if user.failed_attempts >= 3:
            user.blocked_until = datetime.now() + timedelta(minutes=1)
            user.failed_attempts = 0

        db.session.commit()
        return jsonify({"message": "Wrong credentials"}), 401

    user.failed_attempts = 0
    user.blocked_until = None
    db.session.commit()


    additonal_claims = {'firstName': user.first_name, 'lastName': user.last_name, 'email': user.email, 'birthDate': user.birth_date, 'gender': user.gender, 'country': user.country, 'street': user.street, 'streetNumber': user.street_number, 'role': user.role, 'picture': user.profile_image}
    token = create_access_token(identity=str(user.id), additional_claims= additonal_claims)
    return jsonify(access_token=token)

@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Logout succesfull"})

@app.route("/profile", methods=["GET", "PUT"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())

    if request.method == "GET":
        cached_user = cache.get(f"user:{user_id}")
        if cached_user:
            return jsonify(cached_user)
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        result = {
            "id": user.id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "birthDate": user.birth_date.strftime("%Y-%m-%d"),
            "gender": user.gender,
            "country": user.country,
            "street": user.street,
            "streetNumber": user.street_number,
            "role": user.role,
            "picture": user.profile_image
        }
        cache.set(f"user:{user_id}", result)
        return jsonify(result)
        

    elif request.method == "PUT":
        data = request.json
        user = User.query.get(user_id)
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.country = data.get("country", user.country)
        user.street = data.get("street", user.street)
        user.street_number = data.get("street_number", user.street_number)
        db.session.commit()

        cache.delete(f"user:{user_id}")
        return jsonify({"message": "Profile updated"})
    
@app.route("/profile/image", methods=["POST"])
@jwt_required()
def upload_profile_image():
    user = User.query.get(int(get_jwt_identity()))

    if "image" not in request.files:
        return jsonify({"message": "No file"}), 400

    image = request.files["image"]

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    path = os.path.join(upload_folder, image.filename)
    image.save(path)

    user.profile_image = path
    db.session.commit()

    cache.delete(f"user:{user.id}")
    return jsonify({"message": "Picture added succesfully"})


@app.route("/uploads/<path:filename>", methods=["GET"])
def get_profile_image(filename):
    path = "uploads/" + filename
    response = send_file(path_or_file=path)
    return response


@app.route("/admin/users", methods=["GET"])
@jwt_required()
def get_users():
    print("HEADERS:", request.headers) 
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)

    if admin.role != UserRole.ADMINISTRATOR.value:
        return jsonify({"message": "Unauthorised access"}), 403

    cached_users = cache.get("users:all")
    if cached_users:
        return jsonify(cached_users)
    
    users = User.query.all()
    result = [
        {
            "id": u.id,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "email": u.email,
            "birthDate": u.birth_date.strftime("%Y-%m-%d"),
            "gender": u.gender,
            "country": u.country,
            "street": u.street,
            "streetNumber": u.street_number,
            "role": u.role
        } for u in users
    ]

    cache.set("users:all", result)
    return jsonify(result)


@app.route("/admin/role/<int:user_id>", methods=["PUT"])
@jwt_required()
def change_role(user_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)

    if admin.role != UserRole.ADMINISTRATOR.value:
        return jsonify({"message": "Unauthorised access"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User doesn't exist"}), 404
    
    data = request.get_json()
    role_str = data["role"].upper()
    try:
        user.role = UserRole[role_str].value  
    except KeyError:
        return jsonify({"message": "Nonexistant role"}), 400

    db.session.commit()
    cache.delete(f"user:{user.id}")
    cache.delete("users:all")

    print(f"MAIL: Role changed into {user.role}")

    role_name = UserRole(user.role).name

    subject = "Role change"
    body = f"""Hello {user.first_name},

        Your role has been changed into {role_name}.

        Warm regards,
        Admin team"""

    # snimi u bazu
    email = Email(
        to=user.email,
        subject=subject,
        body=body
        )
    db.session.add(email)
    db.session.commit()

    
    try:
        start_email_process(user.email, subject, body)

    except Exception as e:
        print("Email error:", e)

    return jsonify({"message": "Role changed"})


@app.route("/admin/user/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    admin = User.query.get(get_jwt_identity())

    if admin.role != UserRole.ADMINISTRATOR.value:
        return jsonify({"message": "Unauthorised access"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User doesn't exist"}), 404

    db.session.delete(user)
    db.session.commit()

    cache.delete(f"user:{user.id}")
    cache.delete("users:all")

    return jsonify({"message": "User deleted"})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Tabels created!")

    app.run(debug=True, port=5000, host="0.0.0.0")