from api_cobot.celery import app
from .modules.motors.rmdx_funtions import RMDX 
from .modules.bluetooth.Bluetooth import BT
from time import sleep
import json



class CobotTasks:
    
    def __init__(self):
        self.motors=RMDX()
        self.motors.setup()
        self.motors.getMotorList()
        self.bt=BT()

        self.current_angles = [0.0]*5
        self.expected_angles = [0.0]*5

    def _speed_angles(self, current_angles, expected_angles, velocity=10):
        if isinstance(velocity, int):
            velocity = [velocity]*len(current_angles)

        full_angles = [abs((a)-(d)) for a, d in zip(current_angles, expected_angles)]

        max_angle = max(full_angles)
        speeds = [5 if round((v * angle / max_angle), 2) < 5 else round((v * angle / max_angle), 2) for angle, v in zip(full_angles, velocity)]

        print(f'''
            \r------- Velocidad Motores ------------
            \rAngulos actuales:  {current_angles},
            \rAngulos deseados:  {expected_angles},
            \rRecorrido motores: {full_angles},
            \rVelocidad:         {speeds}
            \r--------------------------------------
        ''')

        return speeds

    def cobot_home_reset(self):
        self.current_angles = [0.0]*5
        self.motors.going_to_zero()
        sleep(3)
    
    def cobot_points(self, command, type, data):
        print("--------------- Point ------------------")
        # Aqui ejecutar movimiento robot (Retardar movimiento) -> data[1]
        self.expected_angles = data[1]
        velocity = self._speed_angles(self.current_angles, self.expected_angles, 50)
        self.motors.send_motion(self.expected_angles, velocity)
        self.current_angles = self.expected_angles
        # ----------------------------------------------------------
        print("Command: " + str(command))
        print("Type: " + str(type))
        print("Data: " + str(data[1]))
        print("----------------------------------------")

    def cobot_movements(self, command, type, data):
        print("-------------- Movement ----------------")
        print("Command: " + str(command))
        print("Type: " + str(type))
        print("Data: " + str(data))
        print("----------------------------------------")
        print("Name: " + str(data[0]))
        print("Gripper: " + str(data[1]))
        print("----- Si lista vacia - True Gripper ----")
        status_list = False
        for angles in data[2]:
            if len(angles) > 0:
                status_list = True
                # Aqui ejecutar movimiento robot (Retardar movimiento) -> i[1]
                # self.motors.send_motion(i[1],[40,40,40,40,40])
                self.cobot_points(command, type, angles)
                print(angles)
                sleep(3)
        if status_list == False:
            # Aqui llamar metodo gripper-> comando: data[1]
            if(data[1] == True):
                self.bt.run("C")
            elif(data[1] == False):
                self.bt.run("A")
            print("Ejecutar Gripper A: ", data[1])
        print("----------------------------------------")
        return 
    
    def cobot_sequences(self, command, type, data):
        pointsList = []
        print("-------------- Sequences ---------------")
        print("Command: " + str(command))
        print("Type: " + str(type))
        print("Data: " + str(data))
        print("----------------------------------------")
        angMaxA=0
        for i in data[1]:
            if len(i) != 0:
                # print(i)
                self.cobot_movements(command, type, i)
                # print("anguloMaxA: ",angMaxA)
        print(pointsList)

    def cobot_angles(self):
        anglesX = json.dumps(self.motors.get_angle_value(1))
        return anglesX
    
    def motors_off(self):
        print("Entre a tasks ejecutar")
        self.motors.motors_off()

    def motors_on(self):
        self.motors.motors_on()
        anglesOn = self.motors.get_angle_value(1)
        return anglesOn

cobottasks = CobotTasks()

@app.task
def cli_tasks(cli):
    if cli == "home":
        cobottasks.cobot_home_reset()
    elif cli == "angles":
        cobottasks.cobot_angles()
    elif cli == "motors_off":
        cobottasks.motors_off()
    elif cli == "motors_on":
        return json.dumps(cobottasks.motors_on())

@app.task
def executor_tasks(command, type, data):
    if type == "point":
        cobottasks.cobot_points(command, type, data)
    elif type == "movement":
        cobottasks.cobot_movements(command, type, data)
    elif type == "sequence":
        cobottasks.cobot_movements(command, type, data)