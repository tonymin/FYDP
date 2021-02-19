#!/usr/bin/env python3
import re
import os
import shutil
import argparse
from pprint import pprint

parser = argparse.ArgumentParser()
parser.add_argument("ssid", help = "network SSID.")
parser.add_argument("--psk", help = "network password, if not provided, script will attempt using saved credentials.")
args = parser.parse_args()
arg_ssid = args.ssid
arg_psk = args.psk
if arg_psk:
    print("psk provided")
else:
    print("psk not provided")

# const
config_file = "/etc/wpa_supplicant/wpa_supplicant.conf"
script_dir = os.path.dirname(os.path.realpath(__file__))
config_template = os.path.join(script_dir, 'wpa_supplicant.conf.tmp')
config_copy = os.path.join(script_dir, 'wpa_supplicant.conf')

# regex
NETWORK = re.compile(r'network\s*\=\s*{')
NETWORK_END = re.compile(r'}')
SSID = re.compile(r'\s*ssid\s*\=\s*\"(.*)\"')
PSK = re.compile(r'\s*psk\s*\=\s*\"(.*)\"')
KEY_MGMT = re.compile(r'\s*key_mgmt\s*\=\s*(.*)')
DISABLED = re.compile(r'\s*disabled\s*\=\s*(.*)')

# read the wpa_supplement.conf file
networks = {}
reading_network = False
ssid, psk, disable, key_mgmt = '','','',''
with open(config_file, 'r') as file:
    for line in file:
        if NETWORK.match(line):
            reading_network = True
        elif NETWORK_END.match(line):
            reading_network = False
            networks[ssid]={
                "psk": psk,
                "disabled": disable,
                "key_mgmt": key_mgmt
                }
        
        if reading_network:
            #print(line)
            ssid_match = SSID.match(line)
            psk_match = PSK.match(line)
            disabled_match = DISABLED.match(line)
            key_mgmt_match = KEY_MGMT.match(line)
            if key_mgmt_match:
                key_mgmt = key_mgmt_match.group(1)
            if disabled_match:
                disable = disabled_match.group(1)
            if ssid_match:
                ssid = ssid_match.group(1)
            if psk_match:
                psk = psk_match.group(1)

# if psk not provided, check if ssid exists and use the original psk. Otherwise quit since psk not available
if not arg_psk:
    if arg_ssid in networks:
        arg_psk = networks[ssid]["psk"]
    else:
        exit()

# create a tmp conf file
shutil.copyfile(config_template, config_copy)

#pprint(networks)

with open(os.path.join(script_dir, 'wpa_supplicant.conf'), 'a') as file:
    for network in networks:
        if network == arg_ssid:
            continue
        file.write("network={\n")
        file.write("      ssid=\"%s\"\n" % (network))
        file.write("      psk=\"%s\"\n" % (networks[network]["psk"]))
        file.write("      disabled=1\n")
        if "key_mgmt" in networks[network] and networks[network]["key_mgmt"]:
            file.write("      key_mgmt="+networks[network]["key_mgmt"]+"\n")
        file.write("}\n\n")

    file.write("\n")

    file.write("network={\n")
    file.write("      ssid=\"%s\"\n" % (arg_ssid))
    file.write("      psk=\"%s\"\n" % (arg_psk))
    file.write("      disabled=0\n")
    file.write("}\n")

# copy the config file to destination
shutil.copyfile(config_copy, config_file)

# reconfigure
os.system('wpa_cli -i wlan0 reconfigure')