import * as access from './lib/access';
import * as errors from './lib/errors';
import * as emergencies from './lib/emergencies';
import * as governingEntities from './lib/governing-entities';
import * as flows from './lib/flows';
import * as forms from './lib/forms';
import * as globalClusters from './lib/global-clusters';
import * as locations from './lib/locations';
import * as operations from './lib/operations';
import * as organizations from './lib/organizations';
import * as plans from './lib/plans';
import * as projects from './lib/projects';
import * as projectVersions from './lib/projectVersions';
import * as reportingWindows from './lib/reporting-windows';
import * as usageYears from './lib/usage-years';
import * as util from './lib/util';

export interface Model {
  access: access.Model;
  emergencies: emergencies.Model;
  governingEntities: governingEntities.Model;
  flows: flows.Model;
  globalClusters: globalClusters.Model;
  locations: locations.Model;
  operations: operations.Model;
  organizations: organizations.Model;
  plans: plans.Model;
  projects: projects.Model;
  reportingWindows: reportingWindows.Model;
  usageYears: usageYears.Model;
}

export {
  access,
  emergencies,
  governingEntities,
  flows,
  forms,
  globalClusters,
  locations,
  operations,
  organizations,
  plans,
  projects,
  projectVersions,
  reportingWindows,
  usageYears,
  errors,
  util,
};
