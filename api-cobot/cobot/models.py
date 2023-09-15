from django.db import models


class Point(models.Model):
    name = models.CharField(max_length=5, primary_key=True)
    motor1_angle = models.FloatField(default=0.0)
    motor2_angle = models.FloatField(default=0.0)
    motor3_angle = models.FloatField(default=0.0)
    motor4_angle = models.FloatField(default=0.0)
    motor5_angle = models.FloatField(default=0.0)


class Movement(models.Model):
    name = models.CharField(max_length=30, primary_key=True)
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
    name = models.CharField(max_length=30, primary_key=True)
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
    movement5 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence5"
    )
    movement6 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence6"
    )
    movement7 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence7"
    )
    movement8 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence8"
    )
    movement9 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence9"
    )
    movement10 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence10"
    )
    movement11 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence11"
    )
    movement12 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence12"
    )
    movement13 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence13"
    )
    movement14 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence14"
    )
    movement15 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence15"
    )
    movement16 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence16"
    )
    movement17 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence17"
    )
    movement18 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence18"
    )
    movement19 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence19"
    )
    movement20 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence20"
    )
    movement21 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence21"
    )
    movement22 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence22"
    )
    movement23 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence23"
    )
    movement24 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence24"
    )
    movement25 = models.ForeignKey(
        Movement, null=True, on_delete=models.CASCADE, related_name="sequence25"
    )
