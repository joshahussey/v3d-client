#!/bin/sh
script=$(readlink -f "$0")
dirname=$(dirname "$script")
rootdir=$(dirname "$dirname")
env_path="$rootdir/config/env"
export $(cat "$env_path" | xargs)
nohup "$dirname"/caddy run --config "$dirname"/caddyfile --adapter caddyfile > "$rootdir"/logs/run.log 2>&1
