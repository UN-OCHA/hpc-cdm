import * as access from './lib/access';
import * as forms from './lib/forms';
import * as operations from './lib/operations';
import * as reportingWindows from './lib/reporting-windows';
import * as errors from './lib/errors';
import * as util from './lib/util';

export interface Model {
  access: access.Model;
  operations: operations.Model;
  reportingWindows: reportingWindows.Model;
}

export { access, forms, operations, reportingWindows, errors, util };
