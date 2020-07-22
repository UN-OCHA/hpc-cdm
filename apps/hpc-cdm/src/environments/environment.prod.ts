import { Environment } from './environment';
import { Session } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';

export const ENVIRONMENT = {
  get session(): Session {
    throw new Error('Production environment not implemented');
  },
  get model(): Model {
    throw new Error('Production environment not implemented');
  },
};

export { Environment };

export default ENVIRONMENT;
