from cobot.tasks import cli_tasks, executor_tasks
from .modules.motors.rmdx_funtions import RMDX 
from time import sleep
import threading
import serial
class Cobot:
    def __init__(self):
        # self.thread = None
        # self.sensor_trama=[False, False, False, False, False, False]
        #self.thread = threading.Thread(target=self.motors.read_to_arduino)
        self.motors=RMDX()
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
            elif type == "read_arduino":
                self.thread = threading.Thread(target=self.motors.read_to_arduino)
                self.thread.start()
                
    # def read_to_arduino(self):
    #     try:
    #         self.ser = serial.Serial("/dev/ttyUSB0", 115200, timeout=None)
    #         sensor_tramax = [False, False, False, False, False]
    #         while self.run_read_arduino:
    #             # ----- Abrir conexion serial con arduino ----
    #             data = self.ser.readline().decode().strip()
    #             aux = [True if c == "1" else False for c in data]
    #             if len(aux) != 0:
    #                 sensor_tramax = aux
    #             self.sensor_trama = sensor_tramax
    #             # print(self.sensor_trama)
    #             sleep(0.001)
    #     except:
    #         print("Stop arduino")