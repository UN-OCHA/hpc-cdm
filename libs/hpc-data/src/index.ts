import * as access from './lib/access';
import * as errors from './lib/errors';
import * as flows from './lib/flows';
import * as forms from './lib/forms';
import * as organizations from './lib/organizations';
import * as operations from './lib/operations';
import * as reportingWindows from './lib/reporting-windows';
import * as util from './lib/util';

export interface Model {
  access: access.Model;
  flows: flows.Model;
  organizations: organizations.Model;
  operations: operations.Model;
  reportingWindows: reportingWindows.Model;
}

export {
  access,
  errors,
  flows,
  forms,
  organizations,
  operations,
  reportingWindows,
  util,
};
