from django.db import models


class Point(models.Model):
    name = models.CharField(max_length=30)
    motor1_angle = models.IntegerField(default=0)
    motor2_angle = models.IntegerField(default=0)
    motor3_angle = models.IntegerField(default=0)
    motor4_angle = models.IntegerField(default=0)
    motor5_angle = models.IntegerField(default=0)


class Movement(models.Model):
    name = models.CharField(max_length=30)
    points = models.ManyToManyField(Point, blank=True)
    gripper = models.BooleanField(default=False)


class Sequence(models.Model):
    name = models.CharField(max_length=30)
    movements = models.ManyToManyField(Movement, null=False)
