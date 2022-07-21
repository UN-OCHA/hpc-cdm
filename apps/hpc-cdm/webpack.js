/* eslint-disable */
const path = require('path');
const upstreamConfig = require('@nrwl/react/plugins/webpack');

module.exports = (config) => {
  config = upstreamConfig(config);

  // Override enketo modules
  config.resolve.alias['enketo/dialog'] = path.resolve(
    __dirname,
    'src/app/components/enketo/overrides/dialog'
  );
  config.resolve.alias['enketo/translator'] = path.resolve(
    __dirname,
    'src/app/components/enketo/overrides/translator'
  );
  config.resolve.alias['@mui/styled-engine'] = '@mui/styled-engine-sc';

  return config;
};
