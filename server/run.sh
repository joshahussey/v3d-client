#!/bin/sh
script=$(readlink -f "$0")
dirname=$(dirname "$script")
rootdir=$(dirname "$dirname")
env_path="$rootdir/config/env"
export $(cat "$env_path" | xargs)
pid_path="/tmp/standalone_server.pid"
if test -e "$pid_path"; then
    pid=$(cat $pid_path)
else
    pid=9999999
fi
if ps -p "$pid" > /dev/null; then
    echo "Killed Caddy process $pid. Starting new server."
    kill -9 "$pid"
else 
    echo "Server not up. Nothing to kill. Starting new server."
fi
nohup "$dirname"/caddy run --config "$dirname"/caddyfile --adapter caddyfile > "$rootdir"/logs/run.log 2>&1 &
echo "$!"> "$pid_path"
