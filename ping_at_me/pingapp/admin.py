from django.contrib import admin

# Register your models here.
from pingapp import models

admin.site.register(models.AppUser)