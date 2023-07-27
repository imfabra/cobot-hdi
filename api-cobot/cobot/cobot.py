from cobot.tasks import cobot_movements, cobot_points, cobot_sequences, cobot_home_reset


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
            elif type=="home":
                cobot_home_reset.delay()

        elif command == "angles":
            pass
