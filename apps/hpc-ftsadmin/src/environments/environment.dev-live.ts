import { config } from '@unocha/hpc-core';
import { initializeLiveEnvironment } from './config-loader';
import env from './env.json';
import { Environment } from './interface';

export { Environment };

export default async (): Promise<Environment> => {
  if (!config.isValid(env)) {
    throw new Error('Invalid config');
  }

  return initializeLiveEnvironment(env);
};
