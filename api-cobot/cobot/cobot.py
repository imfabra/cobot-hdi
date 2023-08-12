from cobot.tasks import cli_tasks, executor_tasks
import json

class Cobot:
    def __init__(self):
        pass

    # command: play
    # type: point or movement or sequence
    def run_command(self, command, type, data=""):
        if command == "play":
            executor_tasks.delay(command, type, data)
        
        elif command == "cli":
            if type=="home":
                cli_tasks.delay("home")
            elif type == "angles":
                return cli_tasks.delay("angles").get()
            elif type == "motors_off":
                cli_tasks.delay("motors_off")
            elif type == "motors_on":
                x = cli_tasks.delay("motors_on").get()
                return x
