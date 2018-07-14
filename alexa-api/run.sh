#!/bin/bash
set -e

WORK_DIR=/data/workdir
CONFIG_PATH=/data/options.json

export USER=$(jq --raw-output ".username" $CONFIG_PATH); export PASS=$(jq --raw-output ".password" $CONFIG_PATH); export URL=$(jq --raw-output ".url" $CONFIG_PATH)

Xvfb -ac -screen scrn 1280x2000x24 :99.0 &
export DISPLAY=:99.0

node index.js
