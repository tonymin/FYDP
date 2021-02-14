#!/bin/bash
#
# This script will initialize the environment
#       - get latest MagicMirror from repository
#       - install all 3rd party modules
#       - update dependencies

function get_module {
    # Credits: https://gist.github.com/nicferrier/2277987
    REPOSRC=$1
    LOCALREPO=$2
    
    # We do it this way so that we can abstract if from just git later on
    LOCALREPO_VC_DIR=$LOCALREPO/.git
    
    if [ ! -d $LOCALREPO_VC_DIR ]
    then
        echo "Cloning ${LOCALREPO}"
        git clone $REPOSRC $LOCALREPO
    else
        echo "Updating ${LOCALREPO}"
        cd $LOCALREPO
        git pull $REPOSRC
    fi
    echo "src:${REPOSRC}"
    echo "dst:${LOCALREPO}"
    echo "*******************"
    
    # clone if not exist or update if exist
    #url=$1
    #folder=$(basename $url .git)
    #echo "Cloning ${url}"
    #if ! git clone "${url}" "${folder}" 2>/dev/null && [ -d "${folder}" ] ; then
    #    echo "Clone failed because the folder ${folder} exists"
    #fi
}

#######################################################
### Constants
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
PROJECTROOT=$SCRIPTPATH
MODULE_DIR="$PROJECTROOT/MagicMirror/modules"

#######################################################
### Init/update MagicMirror submodule
git submodule update --init --recursive

#######################################################
### 3rd party modules
# IMPORTANT: double check the name of destination folder matches the module repo name

#get_module https://github.com/Veldrovive/MMM-Page-Selector.git "${MODULE_DIR}/MMM-Page-Selector"
get_module https://github.com/edward-shen/MMM-pages.git "${MODULE_DIR}/MMM-pages"
get_module https://github.com/edward-shen/MMM-page-indicator.git "${MODULE_DIR}/MMM-page-indicator"
get_module https://github.com/Jopyth/MMM-Remote-Control.git "${MODULE_DIR}/MMM-Remote-Control"
#get_module https://github.com/semox/MMM-NearCompliments.git "${MODULE_DIR}/MMM-NearCompliments"
#get_module https://github.com/paviro/MMM-PIR-Sensor.git "${MODULE_DIR}/MMM-PIR-Sensor"

#######################################################
### copy custom module

cp -R "$SCRIPTPATH/MMM-SensorControl" "${MODULE_DIR}/MMM-SensorControl"

#######################################################
### install & update MagicMirror packages
cd $PROJECTROOT/MagicMirror
npm install # need this to install dependencies
npm update # need this to update dependencies
