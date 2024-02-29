#!/bin/sh
pid_path="/tmp/standalone_backend.pid"
if test -e "$pid_path"; then
    pid=$(cat $pid_path)
else
    pid=9999999
fi
if ps -p "$pid" > /dev/null; then
    echo "Killed backend process $pid. Starting new backend."
    kill -9 "$pid"
else 
    echo "Backend not up. Nothing to kill. Starting new backend."
fi
script=$(readlink -f "$0")
dirname=$(dirname "$script")
rootdir=$(dirname "$dirname")
nohup "$dirname"/cslt3d > "$rootdir"/logs/backend.log 2>&1 &
echo "$!"> "$pid_path"
