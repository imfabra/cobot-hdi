from api_cobot.celery import app
from time import sleep


@app.task
def cobot_movements(command, type, data):
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
            print(i)
    if status_list == False:
        # Aqui llamar metodo gripper-> comando: data[1]
        print("Ejecutar Gripper A: ", data[1])
    print("----------------------------------------")


@app.task
def cobot_points(command, type, data):
    print("--------------- Point ------------------")
    # Aqui ejecutar movimiento robot (Retardar movimiento) -> data[1]
    print("Command: " + str(command))
    print("Type: " + str(type))
    print("Data: " + str(data))
    print("----------------------------------------")


@app.task
def cobot_sequences(command, type, data):
    pointsList = []
    print("-------------- Sequences ---------------")
    print("Command: " + str(command))
    print("Type: " + str(type))
    print("Data: " + str(data))
    print("----------------------------------------")
    for i in data[1]:
        if len(i) != 0:
            # print(i)
            cobot_movements(command, type, (i))
    print(pointsList)
