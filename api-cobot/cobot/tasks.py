from api_cobot.celery import app
from .modules.motors.rmdx_funtions import RMDX 
from .modules.bluetooth.Bluetooth import BT
from .modules.gripper.gripper import Gripper
from time import sleep
import json



class CobotTasks:
    
    def __init__(self):
        self.motors=RMDX()
        self.motors.setup()
        self.motors.getMotorList()

        self.bt=BT()
        self.gripper = Gripper()

        self.current_angles = self.motors.get_angle_value(0)
        self.expected_angles = [0.0]*5

    def _speed_angles(self,e_angles, vel=10):
        timer_base = 1
        angle_base = 25
        c_angles = self.motors.get_angle_value(0)

        full_angles = [round(abs((a)-(d)),1) for a, d in zip(self.motors.get_angle_value(0), e_angles)]
        max_angle = max(full_angles)

        if isinstance(vel, int):
            vel = [vel]*len(c_angles)

        timer = (max_angle*timer_base)/angle_base
        aux_speeds = [round((v * angle / max_angle), 2) if max_angle !=0 else round((v * angle / 1), 2) for angle, v in zip(full_angles, vel)]
        speeds = [min_sp if min_sp > 4 else 3 for min_sp in aux_speeds]
        speeds[0]= 10 if speeds[0]<10 else speeds[0]
        print(f'''
            \r------- Velocidad Motores ------------
            \rAngulos actuales:  {c_angles},
            \rAngulos deseados:  {e_angles},
            \rRecorrido motores: {full_angles},
            \rVelocidad:         {speeds}
            \r--------------------------------------
        ''')
        return speeds, timer

    def cobot_home_reset(self):
        self.current_angles = [0.0]*5
        self.motors.going_to_zero()
        sleep(3)
    
    def cobot_points(self, command, type, d):
        print("--------------- Point ------------------")

        self.expected_angles = d[1]
        velocity, sleep_stop = self._speed_angles(self.expected_angles, 45)
        #velocity = [50]*5 
        #sleep_stop = 3
        self.motors.send_motion(self.expected_angles, velocity)
        print(f"""timer: {sleep_stop}""")
        print("----------------------------------------")
        return sleep_stop

        
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
                #self.motors.send_motion(angles[1],[40,40,40,40,40])
                stop = self.cobot_points(command, type, angles)
                print(angles)
                sleep(stop)
                # sleep(0.25)
        if status_list == False:
            # Aqui llamar metodo gripper-> comando: data[1]
            if(data[1] == True):
                # self.bt.run("C")
                self.gripper.gripper_cli("1")
                sleep(1.5)
            elif(data[1] == False):
                # self.bt.run("A")
                self.gripper.gripper_cli("1")
                sleep(1.5)
                
            print("Ejecutar Gripper A: ", data[1])
        print("----------------------------------------")
        return 
    
    def cobot_sequences(self, command, type, data):
        print("-------------- Sequences ---------------")
        print("Command: " + str(command))
        print("Type: " + str(type))
        print("Data: " + str(data))
        print("----------------------------------------")
        for i in data[1]:
            if len(i) != 0:
                self.cobot_movements(command, type, i)

    def cobot_angles(self):
        anglesX = self.motors.get_angle_value(1)
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
        return json.dumps(cobottasks.cobot_angles())
    elif cli == "motors_off":
        cobottasks.motors_off()
    elif cli == "motors_on":
        return json.dumps(cobottasks.motors_on())

@app.task
def executor_tasks(command, type, da):
    if type == "point":
        cobottasks.cobot_points(command, type, da)
    elif type == "movement":
        cobottasks.cobot_movements(command, type, da)
    elif type == "sequence":
        cobottasks.cobot_sequences(command, type, da)