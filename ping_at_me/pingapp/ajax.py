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
		q = models.AppUser.objects.order_by('-username').exclude(pk = user.id).exclude(pk__in = [friend.id for friend in user.friends.all()] + [requested.id for requested in user.requested.all()]).filter(username__icontains = username)[:10]
		results = [{'username': u.username, 'id': u.id,} for u in q]

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

		request_user = models.AppUser.objects.get(pk = request_id)
		request_user.requests.add(user)
		request_user.save()

		return HttpResponse('OK', status = 200)