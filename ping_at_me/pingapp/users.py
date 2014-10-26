from django.contrib.auth import authenticate, login, logout

from pingapp import models

def register(username, email, password):
	"""
	Register a new AppUser.
	Validation is done in forms.
	"""

	newuser = models.AppUser(username = username, email = email)
	newuser.set_password(password)
	newuser.save()

	return newuser

def user_auth(request, username, password):
	user = authenticate(username = username, password = password)

	if user is not None:
		login(request, user)
		
		return True

	return False

def user_logout(request):
	logout(request)

def search_users(user, search_username):
	q = models.AppUser.objects.order_by('-username').exclude(pk = user.id).exclude(pk__in = [friend.id for friend in user.friends.all()] + [requested.id for requested in user.requested.all()]).filter(username__icontains = search_username)[:10]
	return [{'username': u.username, 'id': u.id,} for u in q]

def send_friend_request(user, request_id):
	request_user = models.AppUser.objects.get(pk = request_id)
	request_user.requests.add(user)
	request_user.save()

def respond_friend_request(user, request_id, request_accept):
	request_user = user.requests.get(pk = request_id)
	user.requests.remove(request_user)
	request_user.requested.remove(user)

	if request_accept:
		user.friends.add(request_user)

	user.save()
	request_user.save()

def remove_friend(user, request_id):
	friend = user.friends.get(pk = request_id)
	user.friends.remove(friend)

	user.save()