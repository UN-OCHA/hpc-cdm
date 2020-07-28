import { Environment } from './interface';
import { Session, config } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';

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
      console.log('config', config);
      const env: Environment = {
        get session(): Session {
          throw new Error('Production environment not implemented');
        },
        get model(): Model {
          throw new Error('Production environment not implemented');
        },
      };
      return env;
    });
