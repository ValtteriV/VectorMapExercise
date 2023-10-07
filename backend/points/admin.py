from django.contrib import admin
from .models import Point

models_list = [Point]
admin.site.register(models_list)
