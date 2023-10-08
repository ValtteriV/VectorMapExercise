from django.http.response import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http.response import JsonResponse
from .models import Point
from .serializers import PointSerializer

class PointView(APIView):
    
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
        point_to_update = Point.objects.get(pointId=pk)
        serializer = PointSerializer(instance=point_to_update,
            data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse('Point updated!', safe=False)
        return JsonResponse('Failed to update Point')

