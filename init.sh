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
        echo "Cloning ${LOCALREPO} src: ${REPOSRC}"
        git clone $REPOSRC $LOCALREPO
    else
        echo "Updating ${LOCALREPO} src: ${REPOSRC}"
        cd $LOCALREPO
        git pull $REPOSRC
    fi
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

#######################################################
### Init/update MagicMirror submodule
git submodule update --init --recursive

#######################################################
### 3rd party modules
cd $PROJECTROOT/MagicMirror/modules

get_module https://github.com/Veldrovive/MMM-Page-Selector.git MMM-Page-Selector
get_module https://github.com/edward-shen/MMM-pages.git MMM-pages
get_module https://github.com/edward-shen/MMM-page-indicator.git MMM-page-indicator

#######################################################
### install & update MagicMirror packages
cd $PROJECTROOT/MagicMirror
npm install
npm update 
