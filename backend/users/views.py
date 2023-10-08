from django.contrib.auth.hashers import make_password
from django.http.response import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import JsonResponse
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated
import json

class UserView(APIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_user(self, pk):
        try:
            user = User.objects.get(id=pk)
            return user
        except user.DoesNotExist:
            raise Http404

    def get(self, request, pk=None):
        if pk:
            data = self.get_user(pk)
            serializer = UserSerializer(data)
        else:    
            data = User.objects.all()
            serializer = UserSerializer(data, many=True)
        return Response(serializer.data)


    def put(self, request, pk=None):
        user_to_update = User.objects.get(id=pk)
        serializer = UserSerializer(instance=user_to_update,
            data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse('User updated!', safe=False)
        return JsonResponse('Failed to update User')

class RegisterView(APIView):

    def post(self, request):
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
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'id': request.user.id, 'username': request.user.username, 'admin': request.user.is_superuser})
