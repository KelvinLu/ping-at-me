from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View

from pingapp import forms, users

# Create your views here.
class homepage(View):
	def get(self, request):
		context = {
			'authform': forms.AuthForm(),
			'registerform': forms.RegisterForm(),
		}
		return render(request, 'pingapp/homepage.html', context)

class register(View):
	def post(self, request):
		registerform = forms.RegisterForm(request.POST)

		if registerform.is_valid():
			print registerform	
			username = registerform.cleaned_data['username']
			email = registerform.cleaned_data['email']
			password = registerform.cleaned_data['password']

			newuser = users.register(username, email, password)

			return HttpResponse('Registered!')

		context = {
			'authform': forms.AuthForm(),
			'registerform': registerform,
		}

		return render(request, 'pingapp/homepage.html', context)

class authenticate(View):
	def post(self, request):
		authform = forms.AuthForm(request.POST)

		if authform.is_valid():		
			username = authform.cleaned_data['username']
			password = authform.cleaned_data['password']

			if users.user_auth(request, username, password):
				return HttpResponse('Logged in!')

		context = {
			'authform': authform,
			'registerform': forms.RegisterForm(),
		}

		authform.errorstring = 'Could not log in'

		return render(request, 'pingapp/homepage.html', context)