from django.db import models

class Transacao(models.Model):
    TYPE = (
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
        ('+poupanca', '+ Poupanca'),
        ('-poupanca', '- Poupanca'),
    )

    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=255)
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TYPE, null=True, blank=True)


    def __str__(self):
        return self.description