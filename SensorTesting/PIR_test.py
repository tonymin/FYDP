#!/usr/bin/env python3
import RPi.GPIO as GPIO
import time

import requests

PIR_InPin = 38

def setup():
    GPIO.setmode(GPIO.BOARD)       # use PHYSICAL GPIO Numbering
    GPIO.setup(PIR_InPin, GPIO.IN)   # set the PIR to IN mode
    
    print ('using pin%d'%PIR_InPin)

def loop():
    state = 0
    while True:
        i = GPIO.input(PIR_InPin)
        if i:
            #GPIO.output(ledPin, GPIO.HIGH)
            if state != i:
                state = i
                print('ON')
                x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger") # send notification
            
        else:
            if state != i:
                state = i
                print('OFF')
            
            #GPIO.output(ledPin, GPIO.LOW)
        #time.sleep(0.01)

def destroy():
    GPIO.cleanup()                      # Release all GPIO

if __name__ == '__main__':    # Program entrance
    print ('Program is starting ... \n')
    setup()
    try:
        loop()
    except KeyboardInterrupt:   # Press ctrl-c to end the program.
        destroy()