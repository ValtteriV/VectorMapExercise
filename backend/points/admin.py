from django.contrib import admin
from .models import Point
from django.contrib.auth.models import User

class PointAdmin(admin.ModelAdmin):
    list_display = ('pointId', 'x', 'y', 'label', 'created_by', 'created_by_username')
    list_filter = ['created_by']

    @admin.display(description='User')
    def created_by_username(self, obj):
        user = User.objects.get(id=obj.created_by)
        return user.username

models_list = [Point]
admin.site.register(models_list, PointAdmin)
