#!/bin/bash
set -e

WORK_DIR=/data/workdir
CONFIG_PATH=/data/options.json

USER=$(jq --raw-output ".username" $CONFIG_PATH)
PASS=$(jq --raw-output ".password" $CONFIG_PATH)

export USER; export PASS

node index.js
