import * as access from './lib/access';
import * as categories from './lib/categories';
import * as emergencies from './lib/emergencies';
import * as systems from './lib/systems';
import * as errors from './lib/errors';
import * as flows from './lib/flows';
import * as forms from './lib/forms';
import * as globalClusters from './lib/global-clusters';
import * as locations from './lib/locations';
import * as organizations from './lib/organizations';
import * as operations from './lib/operations';
import * as plans from './lib/plans';
import * as projects from './lib/projects';
import * as reportingWindows from './lib/reporting-windows';
import * as usageYears from './lib/usageYears';
import * as currencies from './lib/currencies';
import * as governingEntities from './lib/governing-entity';
import * as util from './lib/util';

export interface Model {
  access: access.Model;
  categories: categories.Model;
  projects: projects.Model;
  plans: plans.Model;
  globalClusters: globalClusters.Model;
  systems: systems.Model;
  emergencies: emergencies.Model;
  flows: flows.Model;
  locations: locations.Model;
  organizations: organizations.Model;
  operations: operations.Model;
  reportingWindows: reportingWindows.Model;
  usageYears: usageYears.Model;
  currencies: currencies.Model;
  governingEntities: governingEntities.Model;
}

export {
  access,
  categories,
  projects,
  plans,
  globalClusters,
  emergencies,
  errors,
  flows,
  forms,
  locations,
  organizations,
  operations,
  reportingWindows,
  usageYears,
  currencies,
  governingEntities,
  util,
  systems,
};
