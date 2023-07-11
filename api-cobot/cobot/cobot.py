class Cobot:
    def __init__(self):
        pass

    # command: play
    # type: point or movement or sequence
    def run_command(self, command, type, data):
        if type == "point":
            print("command cobot: ", command, "\ntype: ", type, "\n", data)
        elif type == "movement":
            print("command cobot: ", command, "\ntype: ", type, "\n", data)
        elif type == "sequence":
            print("command cobot: ", command, "\ntype: ", type, "\n", data)
