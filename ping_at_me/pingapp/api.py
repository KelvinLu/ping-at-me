from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import View
from django.core.paginator import Paginator

from rest_framework import generics, status, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView

import json

from pingapp import models, forms, users, ping, serializers
from ping_at_me import config



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
			print register_form.errors
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



class UserSearchList(APIView):
	serializer_class = serializers.AppUserSerializer

	def get(self, request):
		pagination_count = 5
		user = self.request.user

		if not user.is_authenticated():
			raise exceptions.PermissionDenied()

		queryset = models.AppUser.objects.all()
		username_query = request.QUERY_PARAMS.get('q', None)

		try:
			page_number = int(request.QUERY_PARAMS.get('page', 0))
			if page_number < 0: raise ValueError()
		except ValueError:
			raise exceptions.ParseError(detail = 'Search parameter page is not a positive integer.')

		# Checks if username_query is an empty string, too.
		if not username_query:
			raise exceptions.ParseError(detail = 'Search parameter q is required.')

		queryset = queryset.exclude(pk = user.pk).exclude(pk__in = [friend.pk for friend in user.friends.all()]).filter(username__icontains = username_query)

		result_count = queryset.count()
		remaining_count = result_count - ((page_number + 1) * pagination_count)
		remaining_count = remaining_count if (remaining_count > 0) else 0

		queryset = queryset[page_number * pagination_count:(page_number + 1) * pagination_count]

		return Response({'users': self.serializer_class(queryset, many = True).data, 'remaining_count': remaining_count})



class FriendSearchList(APIView):
	serializer_class = serializers.AppUserSerializer

	def get(self, request):
		pagination_count = 5
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		username_query = request.QUERY_PARAMS.get('q', None)
		page_number = int(request.QUERY_PARAMS.get('page', 0))

		queryset = user.friends.all()	

		if username_query is not None:
			queryset = queryset.filter(username__icontains = username_query)

		result_count = queryset.count()
		remaining_count = result_count - ((page_number + 1) * pagination_count)
		remaining_count = remaining_count if (remaining_count > 0) else 0

		queryset = queryset[page_number * pagination_count:(page_number + 1) * pagination_count]

		return Response({'users': self.serializer_class(queryset, many = True).data, 'remaining_count': remaining_count})

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
		pagination_count = 5
		user = request.user

		if not user.is_authenticated():
			raise exceptions.NotAuthenticated()

		username_query = request.QUERY_PARAMS.get('q', None)

		try:
			page_number = int(request.QUERY_PARAMS.get('page', 0))
			if page_number < 0: raise ValueError()
		except ValueError:
			raise exceptions.ParseError(detail = 'Search parameter page is not a positive integer.')

		queryset = user.requests.all()		

		if username_query is not None:
			queryset = queryset.filter(username__icontains = username_query)

		result_count = queryset.count()
		remaining_count = result_count - ((page_number + 1) * pagination_count)
		remaining_count = remaining_count if (remaining_count > 0) else 0

		queryset = queryset[page_number * pagination_count:(page_number + 1) * pagination_count]

		return Response({'users': self.serializer_class(queryset, many = True).data, 'remaining_count': remaining_count})

	def post(self, request):
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



class FireBaseUrl(View):
	def get(self, request):
		return HttpResponse(json.dumps({'url': config.FIREBASE_URL}), content_type='application/json', status = 200)



class FireBaseAuth(View):
	def get(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse(json.dumps({'authenticated': False}), content_type='application/json', status = 401)

		return HttpResponse(json.dumps({'token': ping.get_auth_token(user), 'userId': user.id}), content_type='application/json', status = 200)



class PingOutbox(View):
	def post(self, request):
		user = request.user
		if not user.is_authenticated():
			return HttpResponse(json.dumps({'authenticated': False}), content_type='application/json', status = 401)

		pingJSON = json.loads(request.body)

		try:
			pingData = {}
			pingData['longitude'] = float(pingJSON.get('longitude', None))
			pingData['latitude'] = float(pingJSON.get('latitude', None))
			pingData['message'] = pingJSON.get('message', None)
			pingData['recipientIds'] = [int(i) for i in (set(pingJSON.get('recipients', None)))]
		except ValueError:
			return HttpResponse(json.dumps({'success': False}), content_type='application/json', status = 400)

		ping.send_ping(user, pingData)

		return HttpResponse(json.dumps({'success': True}), content_type='application/json', status = 200)

	def get(self, request):
		user = request.user
		ping.send_ping(user, {
			'longitude': -122.040237,
			'latitude': 37.529659,
			'message': 'get request to api',
			'recipientIds': [23],
		})

		return HttpResponse(json.dumps({'success': True}), content_type='application/json', status = 200)