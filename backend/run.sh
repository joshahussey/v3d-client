#!/bin/sh
script=$(readlink -f "$0")
dirname=$(dirname "$script")
"$dirname"/cslt3d > "$dirname"/logs/backend.log 2>&1
