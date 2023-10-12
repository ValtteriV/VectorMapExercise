from django.contrib import admin
from .models import Point

class PointAdmin(admin.ModelAdmin):
    """
    Creates the Admin page for Points. created_by display's :model:`auth.User` username.
    """

    list_display = ('pointId', 'x', 'y', 'label', 'created_by')
    list_filter = ['created_by_id']

models_list = [Point]
admin.site.register(models_list, PointAdmin)
