# -*- coding: utf-8 -*-
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import Group, User
from django.contrib.sites.shortcuts import get_current_site
from django.db import transaction
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views import View
from django.views.generic import RedirectView

from autenticacao_app.models import Usuario
from autenticacao_app.tokens import account_activation_token

from .forms import UsuarioCreateForm


def account_activation_sent(request):
    return render(request, "registration/account_activation_sent.html")


def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Usuario.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        if not user.is_active:
            group_cliente = Group.objects.get(name="Clientes")
            user.groups.add(group_cliente)
            user.is_active = True
            user.save()
            # login(request, user)
            messages.success(request, "Usuario Habilitado com Sucesso")
            return redirect("autenticacao:login")
        messages.error(request, "Usuario ja esta Habilitado")
        return redirect("autenticacao:login")
    else:
        return render(request, "registration/account_activation_invalid.html")


@transaction.atomic
def signup(request):
    if request.method == "POST":
        form = UsuarioCreateForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            current_site = get_current_site(request)
            subject = "Ativacao Conta Mazur Architectural Visualization"
            message = render_to_string(
                "registration/account_activation_email.html",
                {
                    "user": user,
                    "domain": current_site.domain,
                    "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                    "token": account_activation_token.make_token(user),
                },
            )
            user.email_user(subject, message)

            return redirect("autenticacao:account_activation_sent")
    else:
        form = UsuarioCreateForm()
    return render(request, "registration/register.html", {"form": form})


# class RegisterView(CreateView):
#     form_class = UsuarioCreateForm
#     success_url = reverse_lazy('login')
#     template_name = 'registration/register.html'

#     def form_valid(self, form):
#         group_cliente = Group.objects.get(name='Clientes')
#         usuario = form.save()
#         usuario.groups.add(group_cliente)
#         messages.success(self.request, 'USUARIO CADASTRADO COM SUCESSO')
#         return super().form_valid(form)

#     def form_invalid(self, form):
#         return super().form_invalid(form)


class LoginView(View):
    template = "registration/login.html"

    # def get_context_data(self, **kwargs):
    #     context = super().get_context_data(**kwargs)
    #     context["ambiente"] = settings.AMBIENTE
    #     return context

    def get(self, request):
        return render(
            request,
            self.template,
            {"form": AuthenticationForm},
        )

    def post(self, request):
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = authenticate(
                request,
                username=form.cleaned_data.get("username"),
                password=form.cleaned_data.get("password"),
            )
            if user is not None:
                login(request, user)
                return redirect(reverse("dashboard"))
        return render(request, self.template, {"form": form})


class LogoutView(RedirectView):
    url = "/autenticacao/login/"

    def get(self, request, *args, **kwargs):
        # messages.success(request, "Sessao Finalizada com Sucesso  ")
        auth_logout(request)
        return super(LogoutView, self).get(request, *args, **kwargs)
