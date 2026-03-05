from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import Usuario


class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.TextInput(
            attrs={"class": "input-md form-control", "placeholder": "E-MAIL"}
        )
    )
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={"class": "input-md form-control", "placeholder": "SENHA"}
        )
    )

    def clean(self):
        user = authenticate(
            email=self.cleaned_data.get("email"),
            password=self.cleaned_data.get("password"),
        )
        if user is None:
            raise forms.ValidationError("Usuario ou Senha Incorreto")
        return self.cleaned_data


class UsuarioCreateForm(UserCreationForm):
    username = forms.EmailField(
        label="E-Mail",
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    first_name = forms.CharField(
        label="Nome",
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    last_name = forms.CharField(
        label="Sobrenome",
        required=True,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    fone = forms.CharField(
        label="Celular",
        required=True,
        widget=forms.TextInput(
            attrs={
                "class": "form-control cel_ddd",
                # "pattern": mark_safe(
                #     "(\([0-9]{2}\))\s([9]{1})?([0-9]{5})-([0-9]{4})"
                # ),
                "title": "Formato: (00) 00000-0000",
            }
        ),
    )
    cor = forms.CharField(
        max_length=7,
        widget=forms.TextInput(
            attrs={"type": "color"}
        ),  # Este é o seletor de cor
    )

    class Meta:
        model = Usuario
        fields = ("username", "first_name", "last_name", "fone", "cor")
        labels = {"username": "Username / E-Mail"}
        widgets = {
            "username": forms.TextInput(
                attrs={"class": "input-md form-control"}
            ),
            "last_name": forms.TextInput(
                attrs={"class": "input-md form-control"}
            ),
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        user.email = self.cleaned_data["username"]
        if commit:
            user.save()
        return user


class UsuarioChangeForm(UserChangeForm):
    class Meta:
        model = Usuario
        fields = ("first_name", "last_name", "fone")
