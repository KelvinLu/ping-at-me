from django import forms

from pingapp import models

import re

class RegisterForm(forms.Form):
    username = forms.CharField(label = 'username', max_length = 30, required = True)
    email = forms.EmailField(label = 'email', required = True)
    password = forms.CharField(label = 'password', max_length = 30, required = True, widget = forms.PasswordInput)

    widgets = {
        'password': forms.PasswordInput(),
    }

    def clean_username(self):
        username = self.cleaned_data['username']
        if models.AppUser.objects.filter(username = username):
            raise forms.ValidationError('Username already taken')
        if not re.match(r'\w+$', username):
            raise forms.ValidationError('Username must only contain letters, numbers, or underscores')
        return username

    def clean_email(self):
        email = self.cleaned_data['email']
        if models.AppUser.objects.filter(email = email):
            raise forms.ValidationError('Email already used')
        return email

    def clean_password(self):
        password = self.cleaned_data['password']
        if len(password) < 6:
            raise forms.ValidationError('Password is too short')
        return password

class AuthForm(forms.Form):
    username = forms.CharField(label = 'username', max_length = 30, required = True)
    password = forms.CharField(label = 'password', max_length = 30, required = True, widget = forms.PasswordInput)

    widgets = {
        'password': forms.PasswordInput(),
    }

class UsernameForm(forms.Form):
    username = forms.CharField(label = 'username', max_length = 30, required = True)