const path = require('path');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const webpack = require('webpack');

module.exports = composePlugins(
  withNx(),
  withReact(),
  (config, { options, context }) => {
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
    // Use styled-components as MUI styled engine
    // https://mui.com/material-ui/guides/styled-engine/#how-to-switch-to-styled-components
    config.resolve.alias['@mui/styled-engine'] = '@mui/styled-engine-sc';

    return config;
  }
);
