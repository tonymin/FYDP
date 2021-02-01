#!/usr/bin/env python3
#
# This script is meant for testing functionalities
#


import requests
from pprint import pprint
import json

data = {
    'ddd' : 2
}

#x = requests.get("http://localhost:8080/api/module/MMM-SensorControl")
#x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger")
x = requests.get("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger/?x=12")
#x = requests.post("http://localhost:8080/api/module/MMM-SensorControl/pir_trigger", data=json.dumps(data), headers={'Content-Type': 'application/json'})
#x = requests.get("http://localhost:8080/api/module")

pprint(json.loads(x.text))