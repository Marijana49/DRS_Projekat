from flask_mail import Message

def send_email(mail, to, subject, body):
    msg = Message(
        subject=subject,
        recipients=[to],
        body=body
    )
    mail.send(msg)