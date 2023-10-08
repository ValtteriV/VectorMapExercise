from django.db import models

class Point(models.Model):
    pointId = models.AutoField(primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    label = models.CharField(max_length=100, null=True)
    created_by = models.IntegerField(null=True)
        
