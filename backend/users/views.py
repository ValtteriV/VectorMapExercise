from django.contrib.auth.hashers import make_password
from django.http.response import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import JsonResponse
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated


class RegisterView(APIView):
    """
    REST API for user registration.
    """

    def post(self, request):
        """
        Receives a JSON object with username and password fields, encrypts the password, and saves the user in the database.
        Returns the created :model:`auth.User` without the password field.
        """

        data = request.data
        serializer = UserSerializer(data=data)

        if serializer.is_valid():
            serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
            serializer.save()
            response = serializer.data
            response.pop('password')
            return Response(response)
        return JsonResponse('Adding user failed', safe=False)

class LoginView(APIView):
    """
    REST API for validating user access to the application. 
    Requires Basic authentication to access.
    """
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Uses Basic authentication to validate if user's credentials are found in the database and returns a :model:`auth.User` on success.
        """
        return Response({'id': request.user.id, 'username': request.user.username, 'admin': request.user.is_superuser})
