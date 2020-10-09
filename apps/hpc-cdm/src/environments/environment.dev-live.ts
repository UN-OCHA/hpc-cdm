import { Environment } from './interface';
import { config } from '@unocha/hpc-core';
import env from './env.json';
import { initializeLiveEnvironment } from './config-loader';

export { Environment };

export default async (): Promise<Environment> => {
  if (!config.isValid(env)) {
    throw new Error('Invalid config');
  }

  return initializeLiveEnvironment(env);
};
