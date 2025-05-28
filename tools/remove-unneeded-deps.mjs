// @ts-check
import fs from 'fs/promises';
import path from 'path';
/**
 * This module removes packages that aren't necessary to install in the
 * production image, speeding up image creation, and reducing image size.
 */

const PACKAGE = path.join(path.dirname(import.meta.dirname), 'package.json');

const PACKAGES_TO_REMOVE = ['cypress'];

(async () => {
  console.log(
    `Removing dependencies that aren't required for production build`
  );

  const PACKAGE_JSON = JSON.parse(
    await (await fs.readFile(PACKAGE)).toString()
  );

  for (const p of PACKAGES_TO_REMOVE) {
    delete PACKAGE_JSON.devDependencies[p];
  }

  await fs.writeFile(PACKAGE, JSON.stringify(PACKAGE_JSON, null, 2));

  console.log(`Done`);
})();
