from motors.rmdx_funtions import RMDX 
from bluetooth.Bluetooth import BT
from time import sleep
motors=RMDX()
bt=BT()
motors.setup()
motors.getMotorList()

if __name__ == '__main__':
    
    y=0

    while not y:

        x=int(input("1.Zero, 2.Motor off, 3.Read angle encoder value, 4.Send motion, 5.Path planning, 6.Motor on, 7.Gripper \n"))

        if (x==1):
            motors.going_to_zero()
            x=0

        if (x==2):
            motors.motors_off()
        if (x==3):
            print("encoder:",motors.get_angle_value())
            print("jason",motors.get_angle_value(1))
            x=0
        if (x==4):
            motors.send_motion([-37.31, -54, -58, -62, 0.0],[40,40,40,40,40])
            sleep(1.7)
            bt.run("C")
            motors.send_motion([-29.42, -15.99, -49.99, -106.48, 0.0],[40,40,40,40,40])
            sleep(1.2)
            motors.send_motion([47.63, -10.92, -50.29, -108.3, 0.0],[40,40,40,40,40])
            sleep(1.8)
            motors.send_motion([50.63, -35.5, -101.5, -37, 0.0],[40,40,40,40,40])
            sleep(2.1)

            bt.run("A")
            sleep(0.5)
            motors.send_motion([48.35, -13.77, -37.17, -110.74, 0.0],[40,40,40,40,40])
            sleep(1)
            motors.send_motion([0.0, 0.0, 0.0, 0.0, 0.0],[40,40,40,40,40])
        if (x==5):
            motors.path_plannig([-37.31, -54.44, -58.65, -63.14, 0.0],[40,40,40,40,40],10)
            sleep(2)
            bt.run("C")
            motors.path_plannig([-29.42, -15.99, -49.99, -106.48, 0.0],[40,40,40,40,40],20)
            sleep(2)
            motors.path_plannig([47.63, -10.92, -50.29, -108.3, 0.0],[40,40,40,40,40],10)
            sleep(2)
            motors.path_plannig([50.63, -37.28, -102.79, -37.39, 0.0],[40,40,40,40,40],20)

            bt.run("A")
            # sleep(3)
            motors.path_plannig([48.35, -13.77, -37.17, -110.74, 0.0],[40,40,40,40,40],10)
            # sleep(3)
            motors.path_plannig([0.0, 0.0, 0.0, 0.0, 0.0],[40,40,40,40,40],5)
        if (x==6):
            motors.motors_on()
        if (x==7):
            bt.run("C")
        if (x==8):
            bt.run("A")