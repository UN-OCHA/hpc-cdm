// @ts-check

/**
 * This module removes packages that aren't neccesary to install in the
 * production image, speeding up image creation, and reducing image size.
 */

const fs = require('fs').promises;
const path = require('path');

const PACKAGE = path.join(path.dirname(__dirname), 'package.json');

const PACKAGES_TO_REMOVE = ['cypress'];

(async () => {
  console.log(
    `Removing dependencies that aren't required for production build`
  );

  const package = JSON.parse(await (await fs.readFile(PACKAGE)).toString());

  for (const p of PACKAGES_TO_REMOVE) {
    delete package.devDependencies[p];
  }

  await fs.writeFile(PACKAGE, JSON.stringify(package, null, 2));

  console.log(`Done`);
})();
