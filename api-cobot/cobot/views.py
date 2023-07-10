from django.http import HttpResponse
from rest_framework import viewsets
from cobot.serializer import PointSerializer, MovementSerializer, SequenceSerializer
from cobot.models import Point, Movement, Sequence


def Hello(request):
    return HttpResponse("Hello Cobot")


# CRUD de gestion de los movimientos
class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.all()
    serializer_class = PointSerializer


class MovementViewSet(viewsets.ModelViewSet):
    queryset = Movement.objects.all()
    serializer_class = MovementSerializer


class SequenceViewSet(viewsets.ModelViewSet):
    queryset = Sequence.objects.all()
    serializer_class = SequenceSerializer


# Funciones esenciales de ejecución
