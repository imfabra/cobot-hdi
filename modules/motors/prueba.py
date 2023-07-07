from rmdx_funtions import RMDX 
from Bluetooth import BT
from time import sleep
motors=RMDX()
bt=BT()
motors.setup()
motors.getMotorList()

if __name__ == '__main__':
    
    y=0

    while not y:

        x=int(input("1.Zero, 2.Motor off, 3.Read angle encoder value, 4.Send motion, 5.Path planning \n"))

        if (x==1):
            motors.going_to_zero()
            x=0
        if (x==2):
            motors.motors_off()
        if (x==3):
            enc=motors.get_angle_value(1)
            print(enc)
            x=0
        if (x==4):
            motors.send_motion([100.45, -47.01, -43.25, 86.46, -2.61],[40,40,40,40,40])
            sleep(0.5)
            motors.send_motion([69.55, -20.08, -106.32, 51.38, -22.51],[40,40,40,40,40])
            sleep(0.5)
            motors.send_motion([111.26, -1.62, -77.3, 100.64, -2.14],[40,40,40,40,40])  
            sleep(0.5)   
            motors.send_motion([0.0,0.0,0.0,0.0,0.0],[40,40,40,40,40]) 
        if (x==5):
            motors.path_plannig([-40,-52,-58,-58,0],[40,40,40,40,40],20)
            sleep(5)
            motors.path_plannig([0,0,0,0,0],[40,40,40,40,40],20)
        if (x==6):
            bt.run("C")
            sleep(5)
            bt.run("A")