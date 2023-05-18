const path = require('path');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

module.exports = composePlugins(
  withNx(),
  withReact(),
  (config, { options, context }) => {
    // Override enketo modules
    config.resolve.alias['enketo/dialog'] = path.resolve(
      __dirname,
      'src/app/components/enketo/overrides/dialog'
    );
    config.resolve.alias['enketo/translator'] = path.resolve(
      __dirname,
      'src/app/components/enketo/overrides/translator'
    );

    return config;
  }
);
