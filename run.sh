#!/bin/bash

set -e

trap "exit" INT TERM ERR
trap "kill 0" EXIT
# | grep '"message": "not ok'
clasp logs --watch --json | grep '"message": "not ok' &
clasp run $1
sleep ${2:-20}