from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Point(models.Model):
    name = models.CharField(max_length=5, primary_key=True)
    motor1_angle = models.IntegerField(default=0)
    motor2_angle = models.IntegerField(default=0)
    motor3_angle = models.IntegerField(default=0)
    motor4_angle = models.IntegerField(default=0)
    motor5_angle = models.IntegerField(default=0)


class Movement(models.Model):
    name = models.CharField(max_length=10, primary_key=True)
    point1 = models.ForeignKey(
        Point, null=True, on_delete=models.CASCADE, related_name="movements_point1"
    )
    point2 = models.ForeignKey(
        Point, null=True, on_delete=models.CASCADE, related_name="movements_point2"
    )
    point3 = models.ForeignKey(
        Point, null=True, on_delete=models.CASCADE, related_name="movements_point3"
    )
    point4 = models.ForeignKey(
        Point, null=True, on_delete=models.CASCADE, related_name="movements_point4"
    )
    point5 = models.ForeignKey(
        Point, null=True, on_delete=models.CASCADE, related_name="movements_point5"
    )
    gripper = models.BooleanField(default=False)


class Sequence(models.Model):
    name = models.CharField(max_length=10, primary_key=True)
    movement1 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence1"
    )
    movement2 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence2"
    )
    movement3 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence3"
    )
    movement4 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence4"
    )
    movement6 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence5"
    )
