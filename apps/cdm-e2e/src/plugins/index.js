// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { preprocessTypescript } = require('@nrwl/cypress/plugins/preprocessor');
const path = require('path');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Preprocess Typescript
  on('file:preprocessor', preprocessTypescript(config));
  // on("before:browser:launch", (browser = {}, args) => {
  //   if (browser.name === "chrome") {
  //     args.push("--disable-site-isolation-trials");
  //     return args;
  //   }
  // });
  // on('before:browser:launch', (browser = {}, args) => {
  //   console.log(config, browser, args);
  //   if (browser.name === 'chrome') {
  //     args.push("--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process");
  //   }
  //   return args;
  // });
  on('before:browser:launch', (browser = {}, args) => {
    console.log(config, browser, args);
    if (browser.name === 'chrome') {
      const ignoreXFrameHeadersExtension = path.join(__dirname, '../extensions/ignore-x-frame-headers');
      args.push(args.push(`--load-extension=${ignoreXFrameHeadersExtension}`));
      args.push("--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process");
    }
    return args;
  });
};
