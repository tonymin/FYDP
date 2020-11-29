#!/usr/bin/env python3
import board
import busio
import digitalio
from adafruit_apds9960.apds9960 import APDS9960

i2c = busio.I2C(board.SCL, board.SDA)
int_pin = digitalio.DigitalInOut(board.D5)
apds = APDS9960(i2c, interrupt_pin=int_pin)

apds.enable_proximity = True
apds.proximity_interrupt_threshold = (0, 175)
apds.enable_proximity_interrupt = True
apds.enable_gesture = True
while True:
    gesture = apds.gesture()
    if gesture == 1:
        print("up")
    if gesture == 2:
        print("down")
    if gesture == 3:
        print("left")
    if gesture == 4:
        print("right")
