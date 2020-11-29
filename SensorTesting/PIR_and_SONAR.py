#!/usr/bin/env python3
#
# Uses PIR and SONAR sensors together to detect distance of object on PIR trigger
#
#

import RPi.GPIO as GPIO
import time

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
    print("Distance:",distance,"cm")

def loop():
    state = 0
    while True:
        i = GPIO.input(PIR_InPin)
        if i:
            if state != i:
                state = i
                print('ON')
                # when PIR triggers, launch the sonar pulses to detect distance
                on_PIR_detect()
        else:
            if state != i:
                state = i
                print('OFF')

def destroy():
    GPIO.cleanup()                      # Release all GPIO

if __name__ == '__main__':    # Program entrance
    print ('Program is starting ... \n')
    setup()
    try:
        loop()
    except KeyboardInterrupt:   # Press ctrl-c to end the program.
        destroy()