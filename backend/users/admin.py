from django.contrib import admin
from django.contrib.auth.models import User

models_list = [User]
admin.site.unregister(User)
admin.site.register(models_list)
