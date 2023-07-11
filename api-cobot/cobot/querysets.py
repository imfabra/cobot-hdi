from cobot.models import Point, Movement, Sequence


class QuerySets:
    def get_point_angles(self, name):
        queryset = Point.objects.filter(name=name).first()
        if queryset:
            data = [
                queryset.name,
                [
                    queryset.motor1_angle,
                    queryset.motor2_angle,
                    queryset.motor3_angle,
                    queryset.motor4_angle,
                    queryset.motor5_angle,
                ],
            ]
            return data
        else:
            return []

    def get_movement_data(self, name):
        queryset = Movement.objects.filter(name=name).first()
        if queryset:
            data = [
                queryset.name,
                queryset.gripper,
                [
                    self.get_point_angles(queryset.point1.name)
                    if queryset.point1
                    else [],
                    self.get_point_angles(queryset.point2.name)
                    if queryset.point2
                    else [],
                    self.get_point_angles(queryset.point3.name)
                    if queryset.point3
                    else [],
                    self.get_point_angles(queryset.point4.name)
                    if queryset.point4
                    else [],
                    self.get_point_angles(queryset.point5.name)
                    if queryset.point5
                    else [],
                ],
            ]
            return data
        else:
            return []

    def get_sequence_data(self, name):
        queryset = Sequence.objects.filter(name=name).first()
        if queryset:
            data = [
                queryset.name,
                # queryset.gripper,
                [
                    self.get_movement_data(queryset.movement1.name)
                    if queryset.movement1
                    else [],
                    self.get_movement_data(queryset.movement2.name)
                    if queryset.movement2
                    else [],
                    self.get_movement_data(queryset.movement3.name)
                    if queryset.movement3
                    else [],
                    self.get_movement_data(queryset.movement4.name)
                    if queryset.movement4
                    else [],
                    self.get_movement_data(queryset.movement5.name)
                    if queryset.movement5
                    else [],
                ],
            ]
            return data
        else:
            return []
