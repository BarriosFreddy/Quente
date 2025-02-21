#!/usr/bin/env bash
# exit on error
set -o errexit

export RENDER_GIT_COMMIT=$RENDER_GIT_COMMIT

npm i
npm run build