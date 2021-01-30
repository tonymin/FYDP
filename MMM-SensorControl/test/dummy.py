#!/usr/bin/env python3
#
# This script is meant for testing functionalities
#


import requests
from pprint import pprint
import json

x = requests.get("http://localhost:8080/api/module/MMM-SensorControl")
#x = requests.get("http://localhost:8080/api/module/alert/")
#x = requests.get("http://localhost:8080/api/module")
y = json.loads(x.text)
pprint(y)