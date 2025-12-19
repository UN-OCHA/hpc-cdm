import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    fileServerFolder: '.',
    fixturesFolder: './src/fixtures',
    modifyObstructiveCode: false,
    supportFile: './src/support/index.ts',
    specPattern: './src/tests/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    videosFolder: '../../dist/cypress/apps/hpc-ftsadmin-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/hpc-ftsadmin-e2e/screenshots',
    chromeWebSecurity: false,
  },
});
