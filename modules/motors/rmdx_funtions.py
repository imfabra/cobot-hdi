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
        if(self.set==0):
            os.system('sudo /sbin/ip link set can0 down')
            self.bus.flush_tx_buffer()
            self.bus.shutdown()
            self.setup()
        can_id = motor_id
        data = data_command
        msg = can.Message(arbitration_id=can_id, data=data, is_extended_id=False)

        try: 
            # send message
            self.bus.send(msg)
            time.sleep(0.1)
            # print("MENSAJE ENVIADO: " + str(msg.data))
            # print("\n")
            
            if(init_again==0):
            # ------------------ read message ----------------------
                receive_message = self.bus.recv(12.0)
                if receive_message is None:
                    print('Timeout occurred, no message.')
                    os.system('sudo /sbin/ip link set can0 down')
                    self.bus.flush_tx_buffer()
                    self.bus.shutdown()
                    self.set=0
            else:
                receive_message=None
                

            # os.system('sudo /sbin/ip link set can0 down')
            # print("MENSAJE RECIVIDO : " + str(receive_message.data))
            # print("\n")
            self.bus.flush_tx_buffer()
            if(init_again==1):
                os.system('sudo /sbin/ip link set can0 down')
                self.bus.shutdown()
                self.set=0
            return receive_message
        except Exception as e:
            print("Fallo por el bus: ",e)
        finally:
            self.bus.flush_tx_buffer()
            if(init_again==1):
                self.bus.shutdown()
                self.set=0

    # ------ main commands ------------------
    def general_comand(self, motor_id,index_parameter):
        param = self.parameter[index_parameter]
        # print("id: ",motor_id,"Comando",param)
        command = getValueConfig(self.header, param)
        message = [command, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        if (index_parameter==10):
            set_again=1
        else:
            set_again=0
        return self.sendToMotor(motor_id, message,set_again)

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
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(movimiento)
            
    def send_speed(self, motor_id,speed):
        value = float(speed)  
        data_send = self.decoi.getDataSpeed(value)
        res = self.setSpeedClosedLoop(motor_id,data_send)

    def send_rotational_motion(self,speeds):
        # print("sending rotational motion ..")
        #listas
        #Tareas en paralelo
        with concurrent.futures.ThreadPoolExecutor() as executor:
            movimiento = [] 
            for motor,speed in zip(self.motor_list,speeds):
                task = executor.submit(self.send_speed,motor,speed)
                movimiento.append(task)
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(movimiento)
    
    def control_stop_motor(self, sensors, states):

        zero_speed = [80.0,-20.0,32.0,-40.0,0.0]
        # send_rotational_motion(motor_list,zero_speed)

        if (sensors[0] == 1 or sensors[1]  == 1) and states[0] == False:  
            self.general_comand(self.motor_list[0],6)
            states[0] = True
        elif (states[0] == True) and (sensors[0] != 1 and sensors[1]  != 1):
            states[0] = False
            self.send_speed(self.motor_list[0],zero_speed[0])


        if (sensors[2] == 1 or sensors[3] == 1) and states[1] == False: 
            self.general_comand(self.motor_list[1],6)
            states[1] = True
        elif (states[1] == True) and (sensors[2] != 1 and sensors[1]  != 1):
            states[1] = False
            self.send_speed(self.motor_list[1],zero_speed[1])


        if (sensors[4] == 1 or sensors[5] == 1) and states[2] == False: 
            self.general_comand(self.motor_list[2],6)
            states[2] = True
        elif (states[2] == True) and (sensors[4] != 1 and sensors[5]  != 1):
            states[2] = False
            self.send_speed(self.motor_list[2],zero_speed[2])


        if (sensors[6] == 1 and states[3] == False): 
            self.general_comand(self.motor_list[3],6)
            states[3] = True
        elif(sensors[6] == 0):
            states[3] = False

    
    def send_action_set_zero_motors(self,motors):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            action = [] 
            for motor in motors:
                task = executor.submit(self.general_comand(motor,1))
                action.append(task)
            
            concurrent.futures.wait(action)
    def motors_off(self):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            action = [] 
            for motor in self.motor_list:
                task = executor.submit(self.general_comand(motor,8))
                action.append(task)
            
            concurrent.futures.wait(action)
    
    def motors_on(self):
        self.send_motion(self.get_angle_value(),[40,40,40,40,40])
        
        
        
    
    def send_action_reset_motors(self, motors):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            action = [] 
            for motor in motors:
                task = executor.submit(self.general_comand(motor,10))
                action.append(task)
                
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(action)
    
    def control_set_zero_mode(self):
        self.send_action_set_zero_motors(self.motor_list)
        self.send_action_reset_motors(self.motor_list)
        self.send_action_set_zero_motors(self.motor_list)
        self.send_action_reset_motors(self.motor_list)
        self.setup()
        self.set=1
    
    def send_motion_to_zero_kine(self, angulos, speeds):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            movimiento = [] 
            for motor, angulo,speed in zip(self.motor_list,angulos,speeds):
                task = executor.submit(self.send_pos_with_speed,motor,angulo,speed)
                movimiento.append(task)
            
            #esperar a quee todas las tareas se completen
            concurrent.futures.wait(movimiento)
    
    def send_pos_with_speed(self, motor_id, value, speed):
        data_send = self.decoi.getDataDegreeWhitSpeed(value,speed)
        res = self.setPositionClosedLoopWithSpeed(motor_id,data_send)
        #Leer respuesta de encoder
        res_list = list()
        res_list = self.decoi.readResponseDataPos(res.data)

    def going_to_zero(self):
        # --------------- Raspberry configs --------------------
        # define pines here
        GPIO.setwarnings(False) 
        GPIO.setmode(GPIO.BCM) 
        #Definicion sensores Numero de GPIO
        button_on_of = 15
        f_1 = 17
        f_2 = 7
        f_3 = 21
        f_4 = 20
        f_5 = 19
        f_6 = 13
        f_7 = 12

        #Seteo de pines
        GPIO.setup(button_on_of, GPIO.IN)
        GPIO.setup(f_1, GPIO.IN)
        GPIO.setup(f_2, GPIO.IN) 
        GPIO.setup(f_3, GPIO.IN) 
        GPIO.setup(f_4, GPIO.IN)    
        GPIO.setup(f_5, GPIO.IN)
        GPIO.setup(f_6, GPIO.IN)
        GPIO.setup(f_7, GPIO.IN) 
        # enable set zero rutine
        enable = True

        #speed for set zero rutine
        zero_speed = [80.0,-20.0,32.0,-20.0,0.0] #velocidad minima motor 3 = 30
        #   zero_speed = [0.0,0.0,0.0,0.0,0.0] #velocidad minima motor 3 = 30
        angulos_zero_kine =[-118.0,110.0,-159.0,22.5,0]
        speed_kine=[80.0,120.0,40.0,40.0,40.0]
        print("going zero")
        #   zero_speed = [15.0]

        self.send_rotational_motion(zero_speed)

        #estados iniciales de stop
        state_m0 = False
        state_m1 = False
        state_m2 = False
        state_m3 = False
        states = [state_m0,state_m1,state_m2,state_m3]

        while enable:
                # step 1: if sensors equal 1 them set zero motors and reset motors
                # sensor trama
                sensor_trama = [GPIO.input(f_1),GPIO.input(f_2),GPIO.input(f_3),
                                GPIO.input(f_4),GPIO.input(f_5),GPIO.input(f_6),GPIO.input(f_7)]
                

                if sensor_trama == [0,1,0,1,1,0,1]:
                    enable = False
                    break;
                else:
                    # print("********SEARCHING ZERO MODE*****")
                    # print("lectura: ",sensor_trama)
                    # sensor_trama_anterior=sensor_trama

                    self.control_stop_motor(sensor_trama,states)
                    enable = True
                # step 3: stop motor when associated sensor A equal 1 or sensor B equal 1
                sleep(0.2)
        
        self.control_set_zero_mode()
        self.send_motion_to_zero_kine(angulos_zero_kine,speed_kine)
        sleep(5)
        self.control_set_zero_mode()
        angulos_zero = [0.1,0.1,0.0,0.0,0.0]
        self.send_motion(angulos_zero,speed_kine) 
        print("Finish set zero")

    def get_angle_value(self,resp=0):
        res_encoder=[0,0,0,0,0]
        enc={"j1":"","j2":"","j3":"","j4":"","j5":""}
        for j in range (5):
            motor_id = self.motor_list[j]
            encoder = self.general_comand(motor_id,3)
            if (j==0 or j==3 or j==4):
                res_encoder[j] = -1*(round((self.decoi.readMultiTurnAngle(encoder.data)),2))
            else:
                res_encoder[j] = round((self.decoi.readMultiTurnAngle(encoder.data)),2)
            if((res_encoder[j]<-360) and (j==0 or j==3 or j==4 )):
                res_encoder[j]=-1*res_encoder[j]
                res_encoder[j]=round(42949673-res_encoder[j],2) 
            elif ((res_encoder[j]>360) and (j==1 or j==2)):
                res_encoder[j]=round((-1*(42949673-res_encoder[j])),2)
            enc[f"j{j+1}"]=res_encoder[j]   


        # print("real_angle_value",res_encoder)
        # print("Json: ", enc)
        return enc if(resp==1) else res_encoder

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


    
    




