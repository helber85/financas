"""
URL configuration for financas_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

import views

urlpatterns = [
    # URLS AUTENTICACAO DJANGO
    path(
        "autenticacao/password_change/",
        auth_views.PasswordChangeView.as_view(
            template_name="registration/change-password.html"
        ),
    ),
    path(
        "autenticacao/password_change/done/",
        auth_views.PasswordChangeDoneView.as_view(
            template_name="registration/done-password.html"
        ),
    ),
    path(
        "autenticacao/password_reset/",
        auth_views.PasswordResetView.as_view(
            template_name="registration/password-reset.html",
        ),
        name="password_reset",
    ),
    path(
        "reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="registration/password-reset-confirm.html",
        ),
        name="password_reset_confirm",
    ),
    path(
        "reset/done/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="registration/password-reset-complete.html"
        ),
        name="password_reset_complete",
    ),
    path(
        "reset_password_sent/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="registration/password-reset-sent.html",
        ),
        name="password_reset_done",
    ),
    # URLS AUTENTICACAO CUSTOM
    path("autenticacao/", include("autenticacao_app.urls")),    
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('admin/', admin.site.urls),
    path('api/', include('financas_app.urls')),
]
