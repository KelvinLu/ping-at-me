from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from pingapp import forms, users, ping

# TODO: Write AJAX endpoints for single page web app

# Create your views here.
class Homepage(View):
	@method_decorator(ensure_csrf_cookie)
	def get(self, request):
		if request.user.is_authenticated():
			return redirect('pingpanel')

		context = {}
		return render(request, 'pingapp/homepage.html', context)

class Pingpanel(View):
	def get(self, request):
		if not request.user.is_authenticated():
			return redirect('homepage')

		context = {}
		return render(request, 'pingapp/pingpanel.html', context)