#!/bin/bash

image_id=$(docker ps -q --filter "ancestor=cslt3d")

if [ -z "${image_id}" ]; then
  echo "No docker image found."
else
  echo "Stopping docker image $image_id"
  docker stop "$image_id"
fi
