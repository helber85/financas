# from django.conf.urls import url
from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    account_activation_sent,
    activate,
    signup,
)

app_name = "autenticacao_app"


urlpatterns = [
    path("register/", signup, name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "account_activation_sent/",
        account_activation_sent,
        name="account_activation_sent",
    ),
    path("activate/<uidb64>/<token>/", activate, name="activate"),
]
