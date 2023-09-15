from rest_framework import serializers
from cobot.models import Point, Movement, Sequence


class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = "__all__"


class MovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movement
        fields = "__all__"


class SequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sequence
        fields = "__all__"
