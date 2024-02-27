#!/bin/sh
if test -e "/tmp/standalone3d.pid"; then
    pid=$(cat /tmp/standalone3d.pid)
else
    pid=9999999
fi
if ps -p $pid > /dev/null; then
kill -9 "$pid"
else 
    echo "Server not up. Nothing to kill. Starting new server"
fi
script=$(readlink -f $0)
dirname=$(dirname "$script")
nohup "$dirname"/caddy file-server --root "$dirname"/web --listen :2015 > "$dirname"/run.log 2>&1 &
echo "$!"> "/tmp/standalone3d.pid"
