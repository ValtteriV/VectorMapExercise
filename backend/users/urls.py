from django.urls import path
from .views import UserView, RegisterView, LoginView

urlpatterns = [
    path('users/', UserView.as_view()),
    path('users/<int:pk>/', UserView.as_view()),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view())
]
