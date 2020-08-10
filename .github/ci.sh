#! /usr/bin/env bash

set -xe

npm install

npm run build

npm run lint

# Tests are currently disabled until we're using them
# npm run test
# npm run e2e
