#!/bin/bash
set -e

WORK_DIR=/data/workdir
CONFIG_PATH=/data/options.json

USER=$(jq --raw-output ".username" $CONFIG_PATH)
PASS=$(jq --raw-output ".password" $CONFIG_PATH)
URL=$(jq --raw-output ".url" $CONFIG_PATH)

export USER; export PASS; export URL

Xvfb -ac -screen scrn 1280x2000x24 :99.0 &
export DISPLAY=:99.0

node index.js
