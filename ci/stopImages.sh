#!/bin/bash

set -euo pipefail

frontendId=$(docker ps -q --filter "ancestor=standalone3d-frontend")
backendId=$(docker ps -q --filter "ancestor=standalone3d-backend")
serverId=$(docker ps -q --filter "ancestor=standalone3d-server")

if [ -z "${frontendId}" ]; then
  echo "No docker frontend image found."
else
  echo "Stopping docker frontend image $frontendId"
  docker stop "$frontendId"
fi

if [ -z "${backendId}" ]; then
  echo "No docker backend image found."
else
  echo "Stopping docker backend image $backendId"
  docker stop "$backendId"
fi

if [ -z "${serverId}" ]; then
  echo "No docker server image found."
else
  echo "Stopping docker server image $serverId"
  docker stop "$serverId"
fi
