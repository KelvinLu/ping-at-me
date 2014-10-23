from django import forms

class RegisterForm(forms.Form):
    username = forms.CharField(label = 'Username', max_length = 30)
    password = forms.CharField(label = 'Password', max_length = 30, widget = forms.PasswordInput)
    email = forms.EmailField(label = 'E-Mail')

    widgets = {
        'password': forms.PasswordInput(),
    }