from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class AppUser(AbstractUser):
	class Meta:
		ordering = ['username']

	requests = models.ManyToManyField('self', symmetrical = False, related_name = 'requested')
	friends = models.ManyToManyField('self', related_name = 'friends')