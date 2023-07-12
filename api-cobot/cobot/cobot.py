class Cobot:
    def __init__(self):
        pass

    # command: play
    # type: point or movement or sequence
    def run_command(self, command, type, data):
        if command == "play":
            if type == "point":
                print("--------------- Point ------------------")
                # Aqui ejecutar movimiento robot (Retardar movimiento) -> data[1]
                print("Command: " + command + "\nType: " + str(type), "\n" + str(data))
                print("----------------------------------------")

            elif type == "movement":
                print("-------------- Movement ----------------")
                print("Command: " + command + "\nType: " + str(type), "\n" + str(data))
                print("----------------------------------------")
                print("Name: ", data[0], "\n" + "Gripper: ", data[1])

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

            elif type == "sequence":
                pointsList = []
                print("----------------------------------------")
                print("Command: " + command + "\nType: " + str(type), "\n" + str(data))
                print("----------------------------------------")
                for i in data[1]:
                    vacio = True if len(i) == 0 else False
                    if vacio == False:
                        print("----------------------------------------")
                        print("Name: ", i[0], "\n" + "Gripper: ", i[1])
                        print("--------------- Puntos -----------------")
                        for x in i[2]:
                            print(x)
                            if len(x) != 0:
                                pointsList.append(x)
                        print("----------------------------------------\n")
                print(pointsList)
        elif command == "angles":
            pass
