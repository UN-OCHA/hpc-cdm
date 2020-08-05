import { Environment } from './interface';
import { config } from '@unocha/hpc-core';
import { LiveBrowserClient } from '@unocha/hpc-live';
import env from './env.json';

export { Environment };

export default async () => {
  if (!config.isValid(env)) {
    throw new Error('Invalid config');
  }

  const live = new LiveBrowserClient(env);
  return live.init();
};
