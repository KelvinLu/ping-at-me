from rest_framework import serializers, pagination

from models import AppUser

class AppUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = AppUser
		fields = ('id', 'username',)