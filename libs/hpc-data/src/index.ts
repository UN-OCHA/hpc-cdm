import * as operations from './lib/operations';
import * as errors from './lib/errors';

export interface Model {
  operations: operations.Model;
}

export { operations, errors };
