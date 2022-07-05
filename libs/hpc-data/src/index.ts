import * as access from './lib/access';
import * as errors from './lib/errors';
import * as emergencies from './lib/emergencies';
import * as flows from './lib/flows';
import * as forms from './lib/forms';
import * as locations from './lib/locations';
import * as operations from './lib/operations';
import * as organizations from './lib/organizations';
import * as plans from './lib/plans';
import * as reportingWindows from './lib/reporting-windows';
import * as usageYears from './lib/usage-years';
import * as util from './lib/util';

export interface Model {
  access: access.Model;
  emergencies: emergencies.Model;
  flows: flows.Model;
  locations: locations.Model;
  operations: operations.Model;
  organizations: organizations.Model;
  plans: plans.Model;
  reportingWindows: reportingWindows.Model;
  usageYears: usageYears.Model;
}

export {
  access,
  emergencies,
  flows,
  forms,
  locations,
  operations,
  organizations,
  plans,
  reportingWindows,
  usageYears,
  errors,
  util,
};
