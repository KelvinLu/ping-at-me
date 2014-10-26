from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View

from pingapp import forms, users

# TODO: Write AJAX endpoints for single page web app

# Create your views here.
class Homepage(View):
	def get(self, request):
		if request.user.is_authenticated():
			return redirect('pingpanel')

		context = {
			'authform': forms.AuthForm(),
			'registerform': forms.RegisterForm(),
		}
		return render(request, 'pingapp/homepage.html', context)

class Register(View):
	def post(self, request):
		registerform = forms.RegisterForm(request.POST)

		if registerform.is_valid():
			username = registerform.cleaned_data['username']
			email = registerform.cleaned_data['email']
			password = registerform.cleaned_data['password']

			newuser = users.register(username, email, password)

			if users.user_auth(request, username, password):
				return redirect('pingpanel')

		context = {
			'authform': forms.AuthForm(),
			'registerform': registerform,
		}

		return render(request, 'pingapp/homepage.html', context)

class Authenticate(View):
	def post(self, request):
		authform = forms.AuthForm(request.POST)

		if authform.is_valid():		
			username = authform.cleaned_data['username']
			password = authform.cleaned_data['password']

			if users.user_auth(request, username, password):
				return redirect('pingpanel')

		context = {
			'authform': authform,
			'registerform': forms.RegisterForm(),
		}

		authform.errorstring = 'Could not log in'

		return render(request, 'pingapp/homepage.html', context)

class Logout(View):
	def get(self, request):
		users.user_logout(request)

		return redirect('homepage')

class Pingpanel(View):
	def get(self, request):
		user = request.user
		if not user.is_authenticated():
			return redirect('homepage')

		context = {
			'user': user,
			'usernameform': forms.UsernameForm(),
		}

		return render(request, 'pingapp/pingpanel.html', context)