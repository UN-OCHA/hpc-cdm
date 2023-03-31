/* eslint-disable */
const path = require('path');
const upstreamConfig = require('@nrwl/react/plugins/webpack');
const webpack = require('webpack');

module.exports = (config) => {
  config = upstreamConfig(config);

  /*
   * To avoid loading version from package.json in application code,
   * which causes unintentional bundling of entire package.json, we
   * are injecting a global variable to expose just the app version.
   *
   * See HPC-9035
   */
  config.plugins ??= [];
  config.plugins.push(
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(require('../../package.json').version),
    })
  );

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
