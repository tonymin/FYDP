#!/usr/bin/bash


SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
CUSTOM_MENU_FILE=`${SCRIPTPATH}/../../custom_menu_remote_control.json`

sed -i 's/"list": ["REPLACE_ME"],/"list": ["REPLACE_ME!"],/' `${CUSTOM_MENU_FILE}`
