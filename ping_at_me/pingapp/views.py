from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View

from pingapp import forms

# Create your views here.
class homepage(View):
	def get(self, request):
		context = {
			'registerform': forms.RegisterForm(),
		}
		return render(request, 'pingapp/homepage.html', context)

	def post(self, request):
		registerform = forms.RegisterForm(request.POST)

		if registerform.is_valid():			
			username = registerform.cleaned_data['username']
			password = registerform.cleaned_data['password']
			email = registerform.cleaned_data['email']

		context = {
			'registerform': forms.RegisterForm(),
		}

		return render(request, 'pingapp/homepage.html', context)