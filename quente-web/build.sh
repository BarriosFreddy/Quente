#!/usr/bin/env bash
# exit on error
set -o errexit

export VITE_APP_RENDER_GIT_COMMIT=$RENDER_GIT_COMMIT

bun install
bun run build