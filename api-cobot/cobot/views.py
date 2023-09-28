from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from cobot.serializer import PointSerializer, MovementSerializer, SequenceSerializer
from cobot.models import Point, Movement, Sequence
from cobot.querysets import QuerySets
from cobot.cobot import Cobot
import json

my_cobot = Cobot()


def Hello(request):
    return HttpResponse("Hello Cobot")


# CRUD de gestion de los movimientos
class PointView(viewsets.ModelViewSet):
    queryset = Point.objects.all()
    serializer_class = PointSerializer


class MovementView(viewsets.ModelViewSet):
    queryset = Movement.objects.all()
    serializer_class = MovementSerializer


class SequenceView(viewsets.ModelViewSet):
    queryset = Sequence.objects.all()
    serializer_class = SequenceSerializer


# Funciones esenciales de ejecución
class PostCommandsView(APIView):
    def post(self, request):
        command = request.data.get("command")
        data_type = request.data.get("type")
        name = request.data.get("name")

        if command == "play":
            if data_type == "point":
                queryset = Point.objects.filter(name=name).first()
                if queryset:
                    serializer = PointSerializer(queryset)
                    qt = QuerySets()
                    data = qt.get_point_angles(name)

                    my_cobot.run_command(command, data_type, data)

                    return Response(serializer.data)
                else:
                    return Response({"error": "Point not found."})
            elif data_type == "movement":
                queryset = Movement.objects.filter(name=name).first()
                if queryset:
                    qt = QuerySets()
                    data = qt.get_movement_data(name)

                    my_cobot.run_command(command, data_type, data)

                    return Response(data)
                else:
                    return Response({"error": "Movement not found."})
            elif data_type == "sequence":
                queryset = Sequence.objects.filter(name=name).first()
                if queryset:
                    qt = QuerySets()
                    data = qt.get_sequence_data(name)

                    my_cobot.run_command(command, data_type, data)

                    return Response(data)
                else:
                    return Response({"error": "Sequence not found."})
            else:
                return Response({"error": "Invalid data type."})
            
        elif command == "cli":
            if data_type=="home":
                my_cobot.run_command(command, data_type)
                # print("going to zero")
                return Response({"Ok": "Going to Zero."})
            elif data_type=="angles":
                x = my_cobot.run_command(command, data_type)
                return Response(json.loads(x))
            elif data_type=="motors_off":
                my_cobot.run_command(command, data_type)
                return Response({"state_motors":"Off"})
            elif data_type=="motors_on":
                x = my_cobot.run_command(command, data_type)
                print("En view data: ", x)
                return Response(json.loads(x))
            elif data_type=="read_arduino":
                my_cobot.run_command(command, data_type)
                return Response({"sensor":"start"})
            else:
                return Response({"error": "Invalid data type."})
        else:
            return Response({"error": "Invalid command."})
