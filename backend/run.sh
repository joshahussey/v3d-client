#!/bin/sh
script=$(readlink -f "$0")
dirname=$(dirname "$script")
rootdir=$(dirname "$dirname")
nohup "$dirname"/cslt3d > "$rootdir"/logs/backend.log 2>&1 &
