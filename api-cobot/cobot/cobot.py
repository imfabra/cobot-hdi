from cobot.tasks import *
import json

class Cobot:
    def __init__(self):
        self.angulo_anterior = cobot_angles.delay().get()
        self.angulo_actuales = None

    def _speed_angles(self, current_angles, expected_angles, velocity):
        if isinstance(velocity, int):
            velocity = [velocity]*len(current_angles)

        full_angles = [abs((a)-(d)) for a, d in zip(current_angles, expected_angles)]

        max_angle = max(full_angles)
        speeds = [round((v*angle/max_angle), 2) for angle, v in zip(full_angles, velocity)]

        print(f'''
            \r------- Velocidad Motores ------------
            \rAngulos actuales:  {current_angles},
            \rAngulos deseados:  {expected_angles},
            \rRecorrido motores: {full_angles},
            \rVelocidad:         {speeds}
            \r--------------------------------------
        ''')

        return speeds

    # command: play
    # type: point or movement or sequence
    def run_command(self, command, type, data=""):
        if command == "play":
            if type == "point":
                self.angulo_actuales = data[1]
                velocidad = self._speed_angles(self.angulo_anterior, self.angulo_actuales, 40)

                cobot_points.delay(command, type, self.angulo_actuales, velocidad)

                self.angulo_anterior = self.angulo_actuales

            elif type == "movement":
                cobot_movements.delay(command, type, data)

            elif type == "sequence":
                cobot_sequences.delay(command, type, data)
        
        elif command == "cli":
            if type=="home":
                self.angulo_anterior = [0.0]*5
                cobot_home_reset.delay()
            elif type == "angles":
                return cobot_angles.delay().get()
            elif type == "motors_off":
                print("En cobot task")
                motors_off.delay()
            elif type == "motors_on":
                x = motors_on.delay().get()
                print("En cobot data: ", x)
                return x
