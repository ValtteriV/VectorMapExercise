from django.urls import path
from .views import PointView

urlpatterns = [
    path('points/', PointView.as_view()),
    path('points/<int:pk>/', PointView.as_view())
]
