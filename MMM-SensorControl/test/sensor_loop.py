#!/usr/bin/env python3
#
# This script is meant for testing functionalities
#


import requests
from pprint import pprint
import json
import argparse
import RPi.GPIO as GPIO
import time
import os

# CONSTANTS
SCRIPT_PATH = os.path.dirname(os.path.realpath(__file__))
PIR_InPin = 38
PIN_TRIGGER = 16
PIN_ECHO = 18

def setup():
    # PIR setup
    print("PIR setup")
    GPIO.setmode(GPIO.BOARD)       # use PHYSICAL GPIO Numbering
    GPIO.setup(PIR_InPin, GPIO.IN)   # set the PIR to IN mode
    print ('using pin%d'%PIR_InPin)

    print("SONAR setup")
    GPIO.setup(PIN_TRIGGER, GPIO.OUT)
    GPIO.setup(PIN_ECHO, GPIO.IN)
    GPIO.output(PIN_TRIGGER, GPIO.LOW)
    print("Waiting for sensor to settle")
    time.sleep(2)

def pulse_sonar_trigger():
    GPIO.output(PIN_TRIGGER, GPIO.HIGH)
    time.sleep(0.00001)
    GPIO.output(PIN_TRIGGER, GPIO.LOW)

def on_PIR_detect():
    pulse_sonar_trigger()
    while GPIO.input(PIN_ECHO)==0:
        pulse_start_time = time.time()
    while GPIO.input(PIN_ECHO)==1:
        pulse_end_time = time.time()
    pulse_duration = pulse_end_time - pulse_start_time
    distance = round(pulse_duration * 17150, 2)
    print("Distance:", distance,"cm")
    return distance

def loop():
    state = 0
    user_detected = False
    while True:
        i = GPIO.input(PIR_InPin)
        if i:
            if state != i:
                state = i
                print('ON')

                # notify magicmirror
                x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger")

            # actively uses ultrasonic to detect user distance while PIR is triggered
            if not user_detected:
                # when PIR triggers and user is not detected, launch the sonar pulses to detect distance
                distance = on_PIR_detect()
                data = {"distance(cm)":distance}
                if distance < 100: # TODO: make distance a parameter
                    x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/user_detected", \
                        data=json.dumps(data), headers={'Content-Type': 'application/json'})
                    user_detected = True
        else:
            if state != i:
                state = i
                user_detected= False
                print('OFF')
                x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/user_absent")

def destroy():
    GPIO.cleanup()                      # Release all GPIO



if __name__ == '__main__':    # Program entrance
    print ('Program is starting ... \n')

    parser = argparse.ArgumentParser()
    parser.add_argument("pos1", help="Positional arg 1")

    args = parser.parse_args()

    data = {
        'pos1 arg' : args.pos1,
        'sensor reset' : 1
    }
    #x = requests.post("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger", data=json.dumps(data), headers={'Content-Type': 'application/json'})

    setup()

    try:
        loop()
    except KeyboardInterrupt:   # Press ctrl-c to end the program.
        destroy()

