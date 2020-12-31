#!/bin/bash

# This script will start the MagicMirror after copying over the custom modules and the config file
# NOTE: Developers should use this script to start the MagicMirror

# Constants
ROOT=`pwd` # set root as script path
MM_ROOT="${ROOT}/MagicMirror"
CONFIG_DIR="${ROOT}/MagicMirror/config"
MODULE_DIR="${ROOT}/MagicMirror/modules"

# copy config file MagicMirror/config
cp ${ROOT}/config.js ${CONFIG_DIR}/config.js

# TODO: Copy over the custom modules to the MagicMirror/modules folder

# run the application
cd ${MM_ROOT}
npm start