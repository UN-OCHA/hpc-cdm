import { Environment } from './environment';
import { Session } from '@unocha/hpc-core';

export const ENVIRONMENT = {
  get session(): Session {
    throw new Error('Production environment not implemented');
  },
};

export { Environment };

export default ENVIRONMENT;
