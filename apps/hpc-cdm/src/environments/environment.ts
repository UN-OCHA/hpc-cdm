// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

import { Session } from '@unocha/hpc-core';
import { Dummy } from '@unocha/hpc-dummy';

const dummy = new Dummy();

export const ENVIRONMENT = {
  get session(): Session {
    return dummy.getSession();
  },
};

export type Environment = typeof ENVIRONMENT;

export default ENVIRONMENT;
