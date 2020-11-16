#!/bin/bash

# this script clones all 3rd party modules into MagicMirror/modules folder

function git_clone {
    # small wraper around git clone
    url=$1
    folder=$(basename $url .git)
    echo "Cloning ${url}"
    if ! git clone "${url}" "${folder}" 2>/dev/null && [ -d "${folder}" ] ; then
        echo "Clone failed because the folder ${folder} exists"
    fi
}

# Get script path. Assume its in project root
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`
PROJECTROOT=$SCRIPTPATH

# Init MagicMirror submodule
git submodule update --init --recursive

# install MagicMirror
cd $PROJECTROOT/MagicMirror
npm install
cp config/config.js.sample config/config.js

# Get all 3rd party modules
cd $PROJECTROOT/MagicMirror/modules

git_clone https://github.com/edward-shen/MMM-pages.git
git clone https://github.com/Veldrovive/MMM-Page-Selector.git
git_clone https://github.com/edward-shen/MMM-page-indicator.git

