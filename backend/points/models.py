from django.contrib.auth.models import User
from django.db import models

class Point(models.Model):
    """
    Stores a single point displayed on the map with its location, label and creator.
    Related to :model:`auth.User`.
    """

    pointId = models.AutoField(primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    label = models.CharField(max_length=100, blank=True, default='')
    created_by = models.ForeignKey(User, models.SET_NULL, blank=True, null=True)
        
