from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View

from pingapp import forms, users, ping

# TODO: Write AJAX endpoints for single page web app

# Create your views here.
class Homepage(View):
	def get(self, request):
		context = {}
		return render(request, 'pingapp/homepage.html', context)