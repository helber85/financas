from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import ContentType, Permission

from .forms import UsuarioChangeForm, UsuarioCreateForm
from .models import Usuario


@admin.register(ContentType)
class CotentTypeAdmin(admin.ModelAdmin):
    model = ContentType


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    model = Permission


@admin.register(Usuario)
class CustomUsuarioAdmin(UserAdmin):
    add_form = UsuarioCreateForm
    form = UsuarioChangeForm
    model = Usuario
    list_display = [
        "first_name",
        "last_name",
        "email",
        "fone",
        "fisioterapeuta",
        "receber_notificacao_aniversario",
        "cor",
        "tema",
        "is_staff",
    ]
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        (
            "Informacoes Pessoais",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "fone",
                    "fisioterapeuta",
                    "receber_notificacao_aniversario",
                    "cor",
                    "tema",
                )
            },
        ),
        (
            "Permissoes",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Data Importantes", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "fone",
                    "fisioterapeuta",
                    "receber_notificacao_aniversario",
                    "cor",
                    "tema",
                ),
            },
        ),
    )

    # Se for um campo personalizado, adicione o widget aqui para garantir que o campo 'cor' seja exibido corretamente
    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == "cor":
            from django.forms import TextInput

            kwargs["widget"] = TextInput(
                attrs={"type": "color"}
            )  # Adiciona o seletor de cor HTML5
        return super().formfield_for_dbfield(db_field, **kwargs)
