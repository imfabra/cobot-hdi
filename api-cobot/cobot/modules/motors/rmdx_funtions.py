import can
import sys
import os
import time
import configparser
from pathlib import Path
import os
import RPi.GPIO as GPIO 
import numpy as np
from time import sleep 
import concurrent.futures
import importlib.util
import concurrent.futures
from .cinematica.kine import Kine 
from .Interprete.decoder import deco
import RPi.GPIO as GPIO 
import serial
import threading
from tqdm import tqdm
import ctypes
from cobot import tasks as ot 



# ------ utils --------------------------
def getDataHex(data):

    if "," in data:
        data = data.split(',')
        data_send = []
        for value in data:
            data_send.append(int(value, 16))
        return data_send
    else:
        return int(data, 16)


def getValueConfig(header, param):
    path = Path(__file__)
    ROOT_DIR = path.parent.absolute()
    config_path = os.path.join(ROOT_DIR, "comands.properties")
    config = configparser.RawConfigParser()
    config.read(config_path)
    return getDataHex(config.get(header, param))


class RMDX:

    def __init__(self):
        self.thread = None
        self.sensor_trama = [False, False, False, False, False, False]
        self.run_read_arduino = True
        self.status_stop=0
        self.thread = threading.Thread(target=self.read_to_arduino)
        self.thread.start()
        self.state=0

        self.bus = None
        self.header = 'codeTypeActionHex'
        self.motor_configs_header = 'MotorConfigs'
        self.motor_id=''
        self.motors=list()
        self.decoi = deco()
        self.motor_list=list()
        self.set=0
        # el indice del parametro se organiza de la siguiente manera
                        # 0:'encoder.read',
                        # 1:'encoder.set.current.zero',
                        # 2:'encoder.getMultiOffset',
                        # 3:'encoder.read.multiTurnsAngle',
                        # 4:'encoder.read.singleTurnAngle',
                        # 5:'error.clear',
                        # 6:'motor.stop',
                        # 7:'motor.run',
                        # 8:'motor.off',
                        # 9:'motor.status',
                        # 10:'motor.reset.system'
        self.parameter=['encoder.read',
                        'encoder.set.current.zero',
                        'encoder.getMultiOffset',
                        'encoder.read.multiTurnsAngle',
                        'encoder.read.singleTurnAngle',
                        'error.clear',
                        'motor.stop',
                        'motor.run',
                        'motor.off',
                        'motor.status',
                        'motor.reset.system']
        # self.auto = self.getValueConfig(self.header,'util.null')
        

    def setup(self):
        # ----------------- setup can ------------------------------
        try:
            os.system('sudo /sbin/ip link set can0 down')
            time.sleep(0.5)
            os.system('sudo /sbin/ip link set can0 up type can bitrate 1000000 ')#restart-ms 100
            # os.system('sudo ifconfig can0 up')
            time.sleep(0.1)
        except Exception as e:
            print("Exception:")
            print(e)

        try:
            # can connection config
            bus = can.interface.Bus(interface='socketcan', channel='can0')  # socketcan_native
        except OSError:
            print('err: PiCAN board was not found')
            exit()
        except Exception as e:
            print("Exception:")
            print(e)

        self.bus = bus
        self.set=1
        return self.bus

    # -------- sends command -------------------------

    def sendToMotor(self, motor_id, data_command,init_again=0):
        # ----------------- send data to motor ---------------------
        can_id = motor_id
        data = data_command
        msg = can.Message(arbitration_id=can_id, data=data, is_extended_id=False)

        try: 
            # send message
            self.bus.send(msg)
            time.sleep(0.1)
            # print("MENSAJE ENVIADO: " + str(msg.data))
            # print("\n")
            
        # ------------------ read message ----------------------
            receive_message = self.bus.recv(1.0)
            if receive_message is None:
                # print('Timeout occurred, no message.')
                receive_message="vacio"
                # os.system('sudo /sbin/ip link set can0 down')
                self.bus.flush_tx_buffer()
                # self.bus.shutdown()
                # self.set=0
            
            # os.system('sudo /sbin/ip link set can0 down')
            # print("MENSAJE RECIVIDO : " + str(receive_message.data))
            # print("\n")
            self.bus.flush_tx_buffer()
            return receive_message
        except Exception as e:
            print("Fallo por el bus: ",e)
        finally:
            self.bus.flush_tx_buffer()
            if(self.set==0):
                self.bus.shutdown()
                self.setup()

    # ------ main commands ------------------
    def general_comand(self, motor_id,index_parameter):
        param = self.parameter[index_parameter]
        # print("id: ",motor_id,"Comando",param)
        command = getValueConfig(self.header, param)
        message = [command, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        if (index_parameter==10):
            self.set=0
        else:
            self.set=1
        return self.sendToMotor(motor_id, message)

    # ----- current(torque) -----------------
    def setTorqueClosedLoop(self, motor_id, data):
        param = 'send.torque'
        command = getValueConfig(self.header, param)
        message = [command, 0x00, 0x00, 0x00,
                   data[0], data[1], 0x00, 0x00]
        return self.sendToMotor(motor_id, message)

    # ----- speed ---------------------------
    def setSpeedClosedLoop(self, motor_id, data):
        param = 'send.speed'
        command = getValueConfig(self.header, param)
        message = [command, 0x00, 0x00, 0x00,
                   data[0], data[1], data[2], data[3]]
        return self.sendToMotor(motor_id, message)

    # ----- position ------------------------
    def setPositionClosedLoop(self, motor_id, data):
        param = 'send.position.singleTurn' #single turns
        command = getValueConfig(self.header, param)
        message = [command, 0x00, 0x00, 0x00,data[0],data[1],0x00,0x00] #Data[1] 0x00 clockwise 0x01 counterclokwise
        return self.sendToMotor(motor_id,message)

    def setPositionClosedLoopWithSpeed(self, motor_id, data):
        param = 'send.position.singleTurn.speed' #single turns
        command = getValueConfig(self.header, param)
        message = [command, 0x00, data[0], data[1],data[2],data[3],data[4],data[5]] 
        return self.sendToMotor(motor_id,message,0)
    
    def setPositionClosedLoopM(self, motor_id, data):
        param = 'send.position.multiTurns' #multi turns
        command = getValueConfig(self.header, param)
        # message = [command,0x00,0x00,0x00,0x64,0x00,0x00,0x00]
        message = [command, 0x00, 0x00, 0x00,data[0],data[1],data[2],data[3]] #Data[1] 0x00 clockwise 0x01 counterclokwise
        return self.sendToMotor(motor_id,message)
    
    def setValueEncoderOffset(self,motor_id,data):
        param = 'encoder.set.value.zero'
        command = getValueConfig(self.header, param)
        message = [command, 0x00, 0x00, 0x00,data[0],data[1],data[2],data[3]]
        return self.sendToMotor(motor_id, message)

    def getMotorList(self):

        motor_0 = getValueConfig(self.motor_configs_header,'motor0.identfy')
        motor_1 = getValueConfig(self.motor_configs_header,'motor1.identfy')
        motor_2 = getValueConfig(self.motor_configs_header,'motor2.identfy')
        motor_3 = getValueConfig(self.motor_configs_header,'motor3.identfy')
        motor_4 = getValueConfig(self.motor_configs_header,'motor4.identfy')

        self.motor_list.append(motor_0)
        self.motor_list.append(motor_1)
        self.motor_list.append(motor_2)
        self.motor_list.append(motor_3)
        self.motor_list.append(motor_4)

        return self.motor_list
    
    def send_motion(self,angulos,speeds):
        #Tareas en paralelo
        angulos[0]=angulos[0]*-1
        angulos[3]=angulos[3]*-1
        angulos[4]=angulos[4]*-1
        with concurrent.futures.ThreadPoolExecutor() as executor:
            movimiento = [] 
            for motor, angulo,speed in zip(self.motor_list,angulos,speeds):
                task = executor.submit(self.send_pos_with_speed,motor,angulo,speed)
                movimiento.append(task)
                sleep(0.01)
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(movimiento)
            
    def send_speed(self, motor_id,speed):
        value = float(speed)  
        data_send = self.decoi.getDataSpeed(value)
        res = self.setSpeedClosedLoop(motor_id,data_send)
        sleep(0.01)

    def send_rotational_motion(self,speeds):
        print("sending rotational motion ..")
        #listas
        #Tareas en paralelo
        with concurrent.futures.ThreadPoolExecutor() as executor:
            movimiento = [] 
            for motor,speed in zip(self.motor_list,speeds):
                task = executor.submit(self.send_speed,motor,speed)
                movimiento.append(task)
                sleep(0.01)
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(movimiento)
    
    #def control_stop_motor(self, sensors, states):

        # zero_speed = [-80.0,-40.0,-32.0,-20.0,0.0]
        # send_rotational_motion(motor_list,zero_speed)

        # if (sensors[0] == True ) and states[0] == False:  
        #     self.general_comand(self.motor_list[0],6)
        #     states[0] = True
        # elif (states[0] == True) and (sensors[0] != True):
        #     states[0] = False
        #     self.send_speed(self.motor_list[0],zero_speed[0])
        
        
            # states[3] = True
        #elif(sensors[3] == False):
        #    states[3] = False
            

    
    def send_action_set_zero_motors(self,motors):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            action = [] 
            for motor in motors:
                task = executor.submit(self.general_comand(motor,1))
                action.append(task)
                sleep(0.01)
            
            concurrent.futures.wait(action)
    def motors_off(self):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            action = [] 
            for motor in self.motor_list:
                task = executor.submit(self.general_comand(motor,8))
                action.append(task)
                sleep(0.01)
            
            concurrent.futures.wait(action)
    
    def motors_on(self):
        angles = self.get_angle_value()
        h = True

        for i in angles:
            if i > 360 or i < -360:
                h = False
        
        if h == True:
            if angles[0] > 0 or angles[0] < 0 or angles[0] == 0:
                self.send_motion(self.get_angle_value(),[30,30,30,30,30])
            else:
                print(f"""Error angulos lectura""")
        else:
            print(f"""Error angulos go zero""")

        
    
    def send_action_reset_motors(self, motors):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            action = [] 
            for motor in motors:
                task = executor.submit(self.general_comand(motor,10))
                action.append(task)
                sleep(0.01)
                
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(action)
    
    def control_set_zero_mode(self):
        self.send_action_set_zero_motors(self.motor_list)
        sleep(0.1)
        self.send_action_reset_motors(self.motor_list)
        sleep(0.1)
        self.send_action_set_zero_motors(self.motor_list)
        sleep(0.1)
        self.send_action_reset_motors(self.motor_list)
        self.setup()
        self.set=1
    
    def send_motion_to_zero_kine(self, angulos, speeds):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            movimiento = [] 
            for motor, angulo,speed in zip(self.motor_list,angulos,speeds):
                task = executor.submit(self.send_pos_with_speed,motor,angulo,speed)
                movimiento.append(task)
                sleep(0.01)
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(movimiento)
    
    def send_pos_with_speed(self, motor_id, value, speed):
        data_send = self.decoi.getDataDegreeWhitSpeed(value,speed)
        res = self.setPositionClosedLoopWithSpeed(motor_id,data_send)
        #Leer respuesta de encoder
        res_list = list()
        res_list = self.decoi.readResponseDataPos(res.data)
    
    def read_to_arduino(self):
        try:
            self.ser = serial.Serial("/dev/ttyUSB0", 115200, timeout=None)
            sensor_tramax = [False, False, False, False, False]
            while self.run_read_arduino:
                # ----- Abrir conexion serial con arduino ----
                data = self.ser.readline().decode().strip()
                aux = [True if c == "1" else False for c in data]
                if len(aux) != 0:
                    sensor_tramax = aux
                self.sensor_trama = sensor_tramax
                # if(self.sensor_trama[4]):
                #      #print("STRAT/STOP")
                #     if (self.state==0):
                #         ot.others_tasks.delay()
                #         self.state=1
                
                # elif(not(self.sensor_trama[4])):
                #     self.state=0 
                #   break
                #print(self.sensor_trama)
                #sleep(0.001)
        except Exception as e:
            print("Stop arduino", e)

    def going_to_zero(self):
        self.run_read_arduino = True
        set_motors = True
        rev_set_motors = True

        
        #speed for set zero rutine
        zero_speed = [-40.0,-30.0,-40.0,-30.0,0.0] #velocidad minima motor 3 = 30
        #zero_speed = [0.0,0.0,0.0,-20.0,0.0] #velocidad minima motor 3 = 30
        angulos_zero_kine =[164.0,90,158.47,22.0,0]
        speed_kine=[80.0,30.0,45.0,40.0,40.0]

        # Inicia un hilo para ejecutar el metodo de lectura de pines arduino
        print("going zero")
        
        for i in tqdm(range(3), desc="1. Estabilizandolectura Arduino ", unit="Sec"):
            sleep(1)
        sensor_trama = self.sensor_trama
        print("2. Trama sensores: ", sensor_trama)

        for x in tqdm(range(4), desc="3. Set inicial motores", unit="Sec"):
            if (sensor_trama[x] == True): 
                self.general_comand(self.motor_list[x],6)
                zero_speed[x] = 0.0
            else:
                set_motors = False
            sleep(1)

        if (set_motors):
            print("Stop Cero... Estabilizado")
            sleep(2) 
        else:
            print("Ciclo")
            self.send_rotational_motion(zero_speed)
            print(zero_speed)
            while not set_motors:
                sensor_trama = self.sensor_trama
                set_motors = True
                rev_set_motors = True
                
                for x in tqdm(range(4), desc="4. Set home motores", unit="Sec"):
                    if (sensor_trama[x] == True): 
                        print("COMMAND STOP")
                        self.general_comand(self.motor_list[x],6)
                    else: 
                        rev_set_motors = False
                
                if rev_set_motors != set_motors:
                    set_motors = False
                
                #sleep(0.001)
        
        print("Iniciando SET ZERO HOME")
        print("Entre zero mode")
        self.control_set_zero_mode()
        print("Sali zero mode")
        print("Entre zero kine")
        self.send_motion_to_zero_kine(angulos_zero_kine,speed_kine)
        print("Sali zero mode")
        
        for x in tqdm(range(5), desc="# Preparando home Set", unit="Sec"):
            sleep(1)

        self.control_set_zero_mode()
        angulos_zero = [0.1,0.1,0.0,0.0,0.0]
        self.send_motion(angulos_zero,speed_kine) 

        self.run_read_arduino = False
        sleep(1)
        #self.thread.join()


        print("Finish set zero")

    def get_angle_value(self,resp=0):
        try:
            res_encoder=[0,0,0,0,0]
            enc={"name":"", "motor1_angle":"","motor2_angle":"","motor3_angle":10,"motor4_angle":"","motor5_angle":""}
            
            # Cargar la biblioteca C++ compilada
            encoders_read = ctypes.CDLL('/home/aria/Documentos/Dev/cplus/read_encoders.so')
            # Definir la firma de la función
            encoders_read.obtenerSalida.restype = ctypes.POINTER(ctypes.c_float * 5)
            # Llamar a la función de C++
            resultado_ptr = encoders_read.obtenerSalida()
            # Convertir el puntero en una lista Python
            res_encoder = [round(resultado_ptr.contents[i], 1) for i in range(5)]

            # print("real_angle_value",res_encoder)
            # print("Json: ", enc)

            for j in range(5):
                enc[f"motor{j+1}_angle"]=res_encoder[j]
            
            return enc if(resp==1) else res_encoder
        except Exception as e:
            print(f"""Error lectura cadena motores: {e}""")
            return {"name":"", "motor1_angle":"","motor2_angle":"","motor3_angle":"","motor4_angle":"","motor5_angle":""} if(resp==1) else [0,0,0,0,0]

    def path_plannig(self,angle_final=[0.0,0.0,0.0,0.0,0.0],speed=[0.0,0.0,0.0,0.0,0.0],steps=2):
        kn = Kine()
        pos_final= list()
        start = self.get_angle_value()
        # for motor in self.motor_list:
        #     angulo_final = float(input(f"angulo final {motor} : "))
        #     pos_final.append(angulo_final)
        for angle in angle_final:
            angulo_final=float(angle)
            pos_final.append(angulo_final)

        print("objetivo",pos_final)

        sub_motion = kn.path_plannig(start,pos_final,steps)
        for array in sub_motion:
            self.send_motion(array,speed)
            sleep(0.1)

