import serial
import time

class Gripper:
    def __init__(self):
        self.ser = serial.Serial("/dev/ttyUSB0", 115200, timeout=None)

    def gripper_cli(self, cli):
        self.ser.write(f'{cli}'.encode())
        print(f'{cli}'.encode())

if __name__ == "__main__":
    gp = Gripper()
    
    gp.gripper_cli("1")
    print("Cli gp")
