from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View
from django.core.paginator import Paginator

from rest_framework import generics, status, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView

import json

from pingapp import models, forms, users, ping, serializers



class AuthLogin(View):
	def get(self, request):
		return HttpResponse('OK', status = 200)

	def post(self, request):
		username = request.POST.get('username', '')
		password = request.POST.get('password', '')

		if username and password and users.user_login(request, username, password):
			return HttpResponse(json.dumps({'authenticated': True}), content_type='application/json', status = 200)

		return HttpResponse(json.dumps({'authenticated': False}), content_type='application/json', status = 401)

class AuthLogout(View):
	def get(self, request):
		users.user_logout(request)
		return HttpResponse(json.dumps({'authenticated': False}), content_type='application/json', status = 200)

class Register(View):
	def post(self, request):
		register_form = forms.RegisterForm(request.POST)

		if register_form.is_valid():
			username = register_form.cleaned_data['username']
			email = register_form.cleaned_data['email']
			password = register_form.cleaned_data['password']

			newuser = users.register(username, email, password)

			users.user_login(request, username, password)
			
			return HttpResponse(json.dumps({'success': True}), content_type='application/json', status = 200)
		else:
			return HttpResponse(json.dumps({'errors': register_form.errors}), content_type='application/json', status = 400)

class Availability(View):
	def get(self, request):
		available = True

		if 'username' in request.GET:
			query = request.GET.get('username')
			if len(query) < 5:
				available = True
			elif models.AppUser.objects.filter(username = query):
				available = False 

		if 'email' in request.GET:
			query = request.GET.get('email')
			if models.AppUser.objects.filter(email = query):
				available = False

		status = 200 if available else 400

		return HttpResponse(json.dumps(available), content_type='application/json', status = status)


class UserSearchList(generics.ListAPIView):
	serializer_class = serializers.AppUserSerializer

	def get_queryset(self):
		user = self.request.user

		if not user.is_authenticated():
			raise exceptions.PermissionDenied()

		queryset = models.AppUser.objects.all()
		username_query = self.request.QUERY_PARAMS.get('q', None)

		# Checks if username_query is an empty string, too.
		if not username_query:
			raise exceptions.ParseError(detail = 'Search parameter q is required.')

		queryset = queryset.exclude(pk = user.pk).exclude(pk__in = [friend.pk for friend in user.friends.all()]).filter(username__icontains = username_query)[:5]

		return queryset

class FriendSearchList(APIView):
	serializer_class = serializers.AppUserSerializer

	def get(self, request):
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		username_query = request.QUERY_PARAMS.get('q', None)

		queryset = user.friends.all()		

		if username_query is not None:
			queryset = queryset.filter(username__icontains = username_query)

		return Response(self.serializer_class(queryset, many = True).data)

	def put(self, request):
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		user_id = request.DATA.get('id', None)
		action = request.DATA.get('action', None)

		try:
			user_id = int(user_id)
		except ValueError:
			raise exceptions.ParseError(detail = 'id parameter should be an integer.')

		success = False

		if action == 'remove':
			success = users.remove_friend(user, user_id)		

		if success:
			return Response({'detail': 'Action accepted.'}, status = 200)

		return Response({'detail': 'Action not accepted.'}, status = 400)			

class RequestSearchList(APIView):
	serializer_class = serializers.AppUserSerializer

	def get(self, request):
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		username_query = request.QUERY_PARAMS.get('q', None)

		queryset = user.requests.all()		

		if username_query is not None:
			queryset = queryset.filter(username__icontains = username_query)

		return Response(self.serializer_class(queryset, many = True).data)

	def post(self, request):
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		print request.DATA

		user_id = request.DATA.get('id', None)
		action = request.DATA.get('action', None)

		try:
			user_id = int(user_id)
		except ValueError:
			raise exceptions.ParseError(detail = 'id parameter should be an integer.')

		success = False

		if action == 'request':
			success = users.make_friend_request(user, user_id)		

		if success:
			return Response({'detail': 'Action ' + action + ' accepted.'}, status = 200)

		return Response({'detail': 'Action ' + action + ' not accepted.'}, status = 400)

	def put(self, request):
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		user_id = request.DATA.get('id', None)
		action = request.DATA.get('action', None)

		try:
			user_id = int(user_id)
		except ValueError:
			raise exceptions.ParseError(detail = 'id parameter should be an integer.')

		success = users.respond_friend_request(user, user_id, action)

		if success:
			return Response({'detail': 'Action accepted.'}, status = 200)

		return Response({'detail': 'Action not accepted.'}, status = 400)