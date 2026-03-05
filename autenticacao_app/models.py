import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("O email e obrigatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("SuperUser precisa ter is_superuser=True")
        return self._create_user(email, password, **extra_fields)


class Usuario(AbstractUser):
    temas = (
        ("light", "light"),
        ("dark", "dark"),
        ("cupcake", "cupcake"),
        ("bumblebee", "bumblebee"),
        ("emerald", "emerald"),
        ("corporate", "corporate"),
        ("synthwave", "synthwave"),
        ("retro", "retro"),
        ("cyberpunk", "cyberpunk"),
        ("valentine", "valentine"),
        ("halloween", "halloween"),
        ("garden", "garden"),
        ("forest", "forest"),
        ("aqua", "aqua"),
        ("lofi", "lofi"),
        ("pastel", "pastel"),
        ("fantasy", "fantasy"),
        ("wireframe", "wireframe"),
        ("black", "black"),
        ("luxury", "luxury"),
        ("dracula", "dracula"),
        ("cmyk", "cmyk"),
        ("autumn", "autumn"),
        ("business", "business"),
        ("acid", "acid"),
        ("lemonade", "lemonade"),
        ("night", "night"),
        ("coffee", "coffee"),
        ("winter", "winter"),
        ("dim", "dim"),
        ("nord", "nord"),
        ("sunset", "sunset"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("E-mail", unique=True)
    fone = models.CharField("Telefone", max_length=15)
    celular = models.CharField("Celular", max_length=15)
    is_staff = models.BooleanField("Membro da Equipe", default=False)
    avatar = models.ImageField(
        "Imagem de Perfil",
        upload_to="uploads/avatars",
        blank=True,
        null=True,
        help_text="Imagem de Perfil",
    )
    tema = models.CharField(
        "Tema", max_length=100, choices=temas, default="night"
    )
    fisioterapeuta = models.BooleanField("Fisioterapeuta", default=False)
    receber_notificacao_aniversario = models.BooleanField(
        "Receber Notificações de Aniversariantes?", default=False
    )
    cor = models.CharField("Cor", max_length=100, default="#383669", null=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "fone"]

    def __str__(self):
        return f"{self.get_full_name()}"

    objects = UsuarioManager()


# class ControleAcesso(Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     usuario = models.ForeignKey(
#         get_user_model(),
#         null=True,
#         related_name="controleacesso",
#         on_delete=models.PROTECT,
#         editable=False,
#     )
#     data_acesso = DateTimeField(auto_now_add=True, verbose_name="criado em")
