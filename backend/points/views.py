from django.http.response import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import JsonResponse
from .models import Point
from .serializers import PointSerializer
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated

class PointView(APIView):
    """
    The REST API for managing points in the database from the frontend application. 
    Requires the user to be authenticated with a Basic authentication.
    """

    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]


    def post(self, request):
        data = request.data 
        serializer = PointSerializer(data=data)

        if serializer.is_valid():
            point = serializer.save()
            resp = PointSerializer(point)
            return Response(resp.data)
        return JsonResponse('Failed to add Point', safe=False)

    def get_point(self, pk):
        try:
            point = Point.objects.get(pointId=pk)
            return point
        except Point.DoesNotExist:
            raise Http404

    def get(self, request, pk=None):
        if pk:
            data = self.get_point(pk)
            serializer = PointSerializer(data)
        else:    
            data = Point.objects.all()
            serializer = PointSerializer(data, many=True)
        return Response(serializer.data)

    def put(self, request, pk=None):
        """
        PUT request to update a :model:`points.Point` in the database.
        Permits changes to points only if user has created the point or if user is a superuser. 
        """

        point_to_update = Point.objects.get(pointId=pk)
        if request.user.id != point_to_update.created_by or request.user.is_superuser:
            return Response('No permission to update Point')
        serializer = PointSerializer(instance=point_to_update,
            data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse('Point updated!', safe=False)
        return Response('Failed to update Point')

