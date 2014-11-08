from django.contrib.auth import authenticate, login, logout

from pingapp import models

def user_login(request, username, password):
	user = authenticate(username = username, password = password)

	if user is not None:
		login(request, user)
		return True

	return False

def user_logout(request):
	logout(request)

def register(username, email, password):
	newuser = models.AppUser(username = username, email = email)
	newuser.set_password(password)
	newuser.save()

	return newuser

def remove_friend(user, user_id):
	try:
		friend_to_remove = user.friends.get(pk = user_id)
	except models.AppUser.DoesNotExist:
		return False

	user.friends.remove(friend_to_remove)
	user.save()

	return True

def make_friend_request(user, user_id):
	try:
		user_to_request = models.AppUser.objects.get(pk = user_id)
	except models.AppUser.DoesNotExist:
		return False

	if user_to_request is user:
		return False

	if user_to_request in user.friends.all():
		return False

	user_to_request.requests.add(user)
	user_to_request.save()

	return True

def respond_friend_request(user, user_id, action):
	try:
		user_requested = models.AppUser.objects.get(pk = user_id)
	except models.AppUser.DoesNotExist:
		return False

	if action == 'accept':
		user.friends.add(user_requested)
	elif action == 'deny':
		pass
	else:
		return False

	user.requests.remove(user_requested)
	user_requested.requested.remove(user)

	user.save()
	user_requested.save()

	return True