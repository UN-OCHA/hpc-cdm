import * as express from 'express';
import { config as initDotenv } from 'dotenv';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as path from 'path';

import { config } from '@unocha/hpc-core';

const DIST_DIR = path.join(path.dirname(__dirname), 'hpc-cdm');
const INDEX = path.join(DIST_DIR, 'index.html');

initDotenv();

const app = express();

app.get('/config.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const c: Partial<config.Config> = {
    HPC_AUTH_URL: process.env.HPC_AUTH_URL,
    HPC_AUTH_CLIENT_ID: process.env.HPC_AUTH_CLIENT_ID,
    HPC_API_URL: process.env.HPC_API_URL,
  };
  const v = config.CONFIG.decode(c);
  if (isRight(v)) {
    res.send(v.right);
  } else {
    if (!config.CONFIG.is(c)) {
      throw new Error(
        `Unable to construct a valid configuration from environment variables:` +
          PathReporter.report(v)
      );
    }
  }
});

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
  res.sendFile(INDEX);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);
