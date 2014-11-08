from pingapp import models

from ping_at_me.secret import FIREBASE_SECRET

from firebase_token_generator import create_token
from firebase import firebase

def get_auth_token(user):
	auth_payload = {'uid': str(user.id), 'username': user.username}
	auth_token = create_token(FIREBASE_SECRET, auth_payload)
	return auth_token

def send_ping():
	pass