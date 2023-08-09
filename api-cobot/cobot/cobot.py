from cobot.tasks import *
import json

class Cobot:
    def __init__(self):
        pass

    # command: play
    # type: point or movement or sequence
    def run_command(self, command, type, data=""):
        if command == "play":
            if type == "point":
                cobot_points.delay(command, type, data)

            elif type == "movement":
                cobot_movements.delay(command, type, data)

            elif type == "sequence":
                cobot_sequences.delay(command, type, data)
        
        elif command == "cli":
            if type=="home":
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
