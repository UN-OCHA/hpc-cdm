const path = require('path');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

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
