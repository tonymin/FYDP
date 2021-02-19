#!/usr/bin/env python
import re
import os
import time

def escape_ansi(line):
    ansi_escape =re.compile(r'(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]')
    return ansi_escape.sub('', line)


script_dir = os.path.dirname(os.path.realpath(__file__))
CUSTOM_MENU_FILE = os.path.normpath(os.path.join(script_dir, '../../custom_menu_remote_control.json'))
CUSTOM_MENU_FILE_TMP = os.path.normpath(os.path.join(script_dir, '../../custom_menu_remote_control.json.tmp'))
network_list_file = os.path.join(script_dir,'tmp')

# regex
network_ptn = re.compile(r'\s*\"(.*)\"\s*')

# copy template menu file
os.system("cp %s %s" % (CUSTOM_MENU_FILE_TMP, CUSTOM_MENU_FILE))

# wlan0 scan network and store ssid list
grep_cmd = r'sudo iwlist wlan0 scan | grep ESSID |grep -oP "\"(.*)\"*"'
pipe_to_file = grep_cmd + " > " + network_list_file

# run cmd
network_list = []
while len(network_list) == 0:
    os.system(pipe_to_file)
    with open(network_list_file, 'r') as file:
        for line in file:
            trimmed_line = line.strip()
            if not trimmed_line: # ignore empty lines
                continue

            network_match = network_ptn.match(trimmed_line)
            if not network_match:
                continue

            # SSID name is empty
            network = network_match.group(1)
            if not network:
                continue

            # SSID with escape characters are invalid
            if '\\' in network:
                print("escape characters detected")
                print(network)
                continue

            network_list.append(trimmed_line)

    network_list = list(dict.fromkeys(network_list)) # remove dups
    time.sleep(3) # we dont want to scan immediately

replacement = ",".join(network_list)
replace_cmd = 'sed -i \'s/\"REPLACE_ME\"/%s/\' %s' % (replacement, CUSTOM_MENU_FILE)
print(replace_cmd)
os.system(replace_cmd)

'''
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
MMM_SENSORCONTROL=`dirname $SCRIPTPATH`
PROJECT_ROOT=`dirname $MMM_SENSORCONTROL`
CUSTOM_MENU_FILE="${PROJECT_ROOT}/custom_menu_remote_control.json"
CUSTOM_MENU_FILE_TMP="${PROJECT_ROOT}/custom_menu_remote_control.json.tmp"

# copy template menu file
cp $CUSTOM_MENU_FILE_TMP $CUSTOM_MENU_FILE

# wlan0 scan network and store ssid list
sudo iwlist wlan0 scan | grep ESSID |grep -oP "\"(.*)\"*" > "${SCRIPTPATH}/tmp"
#ssid_list=`sudo iwlist wlan0 scan | grep ESSID |grep -oP "\"(.*)\"*"`
#ssid_list=($(sudo iwlist wlan0 scan | grep ESSID |grep -oP "\"(.*)\"*"))

#echo $ssid_list
#for each in "${ssid_list[@]}"
#do
#  echo "$each"
#done

# replace the dropdown menu
#sed -i 's/REPLACE_ME/REPLACED_ME/' $CUSTOM_MENU_FILE
'''