from django.http import HttpResponse
from django.views.generic import View

from pingapp import models

from ping_at_me.secret import FIREBASE_SECRET, FIREBASE_EMAIL
from ping_at_me.config import FIREBASE_URL

from firebase_token_generator import create_token
from firebase import firebase

import datetime



firebaseAuth = firebase.FirebaseAuthentication(FIREBASE_SECRET, FIREBASE_EMAIL, extra = {'admin': True})
firebaseRef = firebase.FirebaseApplication(FIREBASE_URL, authentication = firebaseAuth)



def get_auth_token(user):
	auth_payload = {'uid': str(user.id), 'username': user.username}
	auth_token = create_token(FIREBASE_SECRET, auth_payload)
	return auth_token



def create_user(user):
	intro_ping = {
		'longitude':	-121.754824,
		'latitude': 	38.537095,
		'message': 		'Welcome to ping@me!',
		'sender': 		{'id': -1, 'username': 'ping@me'},
		'timestamp': 	get_utc_timestamp(),
	}

	firebaseRef.post('/pingInbox/' + str(user.id), intro_ping)



def get_user_friends_by_id(user, friendIds):
	friend_ids = [f['id'] for f in user.friends.all().filter(id__in = friendIds).values('id')]
	return friend_ids



def get_utc_timestamp():
	return (datetime.datetime.utcnow() - datetime.datetime(1970,1,1)).total_seconds()



def send_ping(user, pingData):
	recipientIds = pingData['recipientIds']

	# Ensure user can only send pings to friends
	recipientIds = get_user_friends_by_id(user, recipientIds)

	pingContents = {
		'longitude':	pingData['longitude'],
		'latitude': 	pingData['latitude'],
		'message': 		pingData['message'],
		'sender': 		{'id': user.id, 'username': user.username},
		'timestamp': 	get_utc_timestamp(),
	}

	for recipientId in recipientIds:
		firebaseRef.post('/pingInbox/' + str(recipientId), pingContents)