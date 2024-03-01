#!/bin/sh
script=$(readlink -f "$0")
dirname=$(dirname "$script")
rootdir=$(dirname "$dirname")
env_path="$rootdir/config/env"
export $(cat "$env_path" | xargs)
nohup "$dirname"/cslt3d > "$rootdir"/logs/backend.log 2>&1 &
