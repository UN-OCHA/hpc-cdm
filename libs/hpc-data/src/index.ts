import * as forms from './lib/forms';
import * as operations from './lib/operations';
import * as reportingWindows from './lib/reporting-windows';
import * as errors from './lib/errors';

export interface Model {
  forms: forms.Model;
  operations: operations.Model;
  reportingWindows: reportingWindows.Model;
}

export { forms, operations, reportingWindows, errors };
