from django.contrib import admin
from django.contrib.auth.models import User
from points.models import Point

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'is_superuser', 'points_created')
    
    @admin.display(description='Points Created')
    def points_created(self, obj):
        data = Point.objects.filter(created_by=obj.id).count()
        return data


models_list = [User]
admin.site.unregister(User)
admin.site.register(models_list, UserAdmin)
