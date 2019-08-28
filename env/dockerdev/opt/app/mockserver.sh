#!/usr/bin/with-contenv sh

cd "$NODE_APP_DIR"

echo "==> Installing npm dependencies"
npm install --no-bin-links

echo "==> Starting the server"
npm run-script mock
