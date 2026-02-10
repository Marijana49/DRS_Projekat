from multiprocessing import Process
from flask import Flask
from flask_mail import Mail, Message
import os

def send_email_process(to, subject, body):
    app = Flask(__name__)

    app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
    app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT"))
    app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS") == "true"
    app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
    app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER")

    mail = Mail(app)

    with app.app_context():
        msg = Message(
            subject=subject,
            recipients=[to],
            body=body
        )
        mail.send(msg)


def start_email_process(to, subject, body):
    p = Process(
        target=send_email_process,
        args=(to, subject, body)
    )
    p.start()