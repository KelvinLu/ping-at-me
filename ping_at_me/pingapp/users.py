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