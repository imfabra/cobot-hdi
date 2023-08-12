from api_cobot.celery import app
from .modules.motors.rmdx_funtions import RMDX 
from .modules.bluetooth.Bluetooth import BT
from time import sleep
import json

motors=RMDX()
motors.setup()
motors.getMotorList()
bt=BT()

@app.task
def cobot_home_reset():
    motors.going_to_zero()
    sleep(5)

@app.task
def cobot_points(command, type, data, velocity):
    print("--------------- Point ------------------")
    # Aqui ejecutar movimiento robot (Retardar movimiento) -> data[1]
    motors.send_motion(data, velocity)
    # ----------------------------------------------------------
    print("Command: " + str(command))
    print("Type: " + str(type))
    print("Data: " + str(data[1]))
    print("----------------------------------------")

@app.task
def cobot_movements(command, type, data, velocity):
    print("-------------- Movement ----------------")
    print("Command: " + str(command))
    print("Type: " + str(type))
    print("Data: " + str(data))
    print("----------------------------------------")
    print("Name: " + str(data[0]))
    print("Gripper: " + str(data[1]))
    print("----- Si lista vacia - True Gripper ----")
    status_list = False
    for i in data[2]:
        if len(i) > 0:
            status_list = True
            # Aqui ejecutar movimiento robot (Retardar movimiento) -> i[1]
            motors.send_motion(i[1],[40,40,40,40,40])
            sleep(2)
            print(i)
    if status_list == False:
        # Aqui llamar metodo gripper-> comando: data[1]
        if(data[1] == True):
            bt.run("C")
        elif(data[1] == False):
            bt.run("A")
        print("Ejecutar Gripper A: ", data[1])
    print("----------------------------------------")
    return 


@app.task
def cobot_sequences(command, type, data):
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
            cobot_movements(command, type, i)
            # print("anguloMaxA: ",angMaxA)
    print(pointsList)


@app.task
def cobot_angles():
    anglesX = json.dumps(motors.get_angle_value(1))
    return anglesX

@app.task
def motors_off():
    print("Entre a tasks ejecutar")
    motors.motors_off()

@app.task
def motors_on():
    motors.motors_on()
    anglesOn = json.dumps(motors.get_angle_value(1))
    return anglesOn

