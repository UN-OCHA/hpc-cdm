import { config } from '@unocha/hpc-core';
import { LiveBrowserClient } from '@unocha/hpc-live';
import { Environment } from './interface';
import { t } from '../i18n';

const parseConfig = async (res: Response) => {
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
};

export const loadEnvForConfig = (url: string): Promise<Environment> =>
  fetch(url).then(parseConfig).then(initializeLiveEnvironment);

export const initializeLiveEnvironment = async (config: config.Config) => {
  const client = new LiveBrowserClient(config);
  const live = await client.init();
  const env: Environment = {
    getDevHeaderWarning(lang) {
      const hostname = new URL(config.hpcApiUrl).hostname;
      if (hostname !== 'api.hpc.tools') {
        return t.t(lang, (s) => s.common.devEnvironmentWarnings.dev);
      }
    },
    get model() {
      return live.model;
    },
    get session() {
      return live.session;
    },
  };
  return env;
};
