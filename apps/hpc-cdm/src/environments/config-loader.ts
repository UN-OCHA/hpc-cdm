import { config } from '@unocha/hpc-core';
import { LiveBrowser } from '@unocha/hpc-live';

export const loadEnvForConfig = (url: string) =>
  fetch(url)
    .then(async (res) => {
      if (res.ok) {
        const c = await res.json();
        if (config.CONFIG.is(c)) {
          return c;
        } else {
          throw new Error('Invalid config');
        }
      } else {
        throw Error(`Unable to get config (${res.status}): ${res.statusText}`);
      }
    })
    .then((config) => {
      const live = new LiveBrowser(config);
      return live.init();
    });
