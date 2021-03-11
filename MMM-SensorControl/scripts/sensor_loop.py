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
    try:
        #pulse_sonar_trigger()
        # inline the function "pulse_sonar_trigger" to reduce function call overhead delay
        GPIO.output(PIN_TRIGGER, GPIO.HIGH)
        time.sleep(0.00001)
        GPIO.output(PIN_TRIGGER, GPIO.LOW)

        while GPIO.input(PIN_ECHO)==0:
            pulse_start_time = time.time()
        while GPIO.input(PIN_ECHO)==1:
            pulse_end_time = time.time()
        pulse_duration = pulse_end_time - pulse_start_time
        distance = round(pulse_duration * 17150, 2)
        print("Distance:", distance,"cm")
        return distance

    except:
        # catch any timing issue
        print("[on_PIR_detect] An exception occurred")
        return 300 # return a distance that is beyond the detection range

def loop(config):
    state = 0
    user_detected = False
    max_distance = 100 if "max_ultrasonic_range" not in config or type(config["max_ultrasonic_range"]) is not int else config["max_ultrasonic_range"]
    while True:
        i = GPIO.input(PIR_InPin)
        if i:
            if state != i:
                state = i
                print('ON')

                # notify magicmirror
                x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger")
                print("pir_detected")
                distance = on_PIR_detect()
                data = {"distance(cm)":distance}
                if distance < max_distance: # check ultrasonic detection distance
                    x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/user_detected", \
                        data=json.dumps(data), headers={'Content-Type': 'application/json'})
                    user_detected = True
                    print("user_detected")
                    time.sleep(1)
'''
            # actively uses ultrasonic to detect user distance while PIR is triggered
            if not user_detected:
                # when PIR triggers and user is not detected, launch the sonar pulses to detect distance
                distance = on_PIR_detect()
                data = {"distance(cm)":distance}
                if distance < max_distance: # check ultrasonic detection distance
                    x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/user_detected", \
                        data=json.dumps(data), headers={'Content-Type': 'application/json'})
                    user_detected = True
                    print("user_detected")
            else:
                # user is already detected, PIR still active. Send signal to MM to reset the idle timer
                time.sleep(2) # wait a bit, we dont want to send to many signals
                x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/user_detected")
'''
        else:
            if state != i:
                state = i
                user_detected= False
                print('OFF')
                x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/user_absent")
    
    time.sleep(1) # sleep to minimize CPU usage
    
def destroy():
    GPIO.cleanup()                      # Release all GPIO



if __name__ == '__main__':    # Program entrance
    print ('Program is starting ... \n')

    parser = argparse.ArgumentParser()
    parser.add_argument("config")

    args = parser.parse_args()
    print(args.config)

    # remove the outter quotes
    config = json.loads(args.config.strip("'"))

    data = {}
    for cf in config:
        data[cf]=config[cf]
    x = requests.post("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger", data=json.dumps(data), headers={'Content-Type': 'application/json'})

    setup()

    try:
        loop(config)
    except KeyboardInterrupt:   # Press ctrl-c to end the program.
        destroy()

