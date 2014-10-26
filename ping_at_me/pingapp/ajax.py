from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View

import json

from pingapp import models, forms, users

class SearchUsers(View):
	def post(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse('You Are Not Authenticated', status = 401)

		usernameform = forms.UsernameForm(request.POST)
		if not usernameform.is_valid():
			return HttpResponse('Invalid POST parameters', status = 422)

		username = usernameform.cleaned_data['username']
		results = users.search_users(user, username)

		return HttpResponse(json.dumps(results), content_type = 'application/json', status = 200)

class MakeFriendRequest(View):
	def post(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse('You Are Not Authenticated', status = 401)

		usernameform = forms.UsernameForm(request.POST)
		if not usernameform.is_valid():
			return HttpResponse('Invalid POST parameters', status = 422)

		return HttpResponse('OK', status = 200)

class SendFriendRequest(View):
	def post(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse('You Are Not Authenticated', status = 401)

		try:
			request_id = int(request.POST.get('id', None))
		except:
			return HttpResponse('Invalid POST parameters', status = 422)

		users.send_friend_request(user, request_id)

		return HttpResponse('OK', status = 200)

class RespondFriendRequest(View):
	def post(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse('You Are Not Authenticated', status = 401)

		try:
			request_id = int(request.POST.get('id', None))
			request_accept = (True if request.POST.get('accept', False) == 'accept' else False)
		except:
			return HttpResponse('Invalid POST parameters', status = 422)

		users.respond_friend_request(user, request_id, request_accept)

		return HttpResponse('OK', status = 200)

class RemoveFriend(View):
	def post(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse('You Are Not Authenticated', status = 401)

		try:
			request_id = int(request.POST.get('id', None))
		except:
			return HttpResponse('Invalid POST parameters', status = 422)

		users.remove_friend(user, request_id)

		return HttpResponse('OK', status = 200)