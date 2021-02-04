#!/usr/bin/env python3
#
# This script is meant for testing functionalities
#


import requests
from pprint import pprint
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("pos1", help="Positional arg 1")

args = parser.parse_args()

data = {
    'pos1 arg' : args.pos1,
    'sensor reset' : 1
}
x = requests.post("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger", data=json.dumps(data), headers={'Content-Type': 'application/json'})

while True:
    pass