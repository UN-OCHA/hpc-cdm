import * as operations from './lib/operations';
import * as reportingWindows from './lib/reporting-windows';
import * as errors from './lib/errors';

export interface Model {
  operations: operations.Model;
}

export { operations, reportingWindows, errors };
