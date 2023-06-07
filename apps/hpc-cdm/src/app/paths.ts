/*
 * Routes in React Router v6 are relative to parent `<Route>`,
 * if there is nesting of `<Route>`s.
 * That is why some paths (don't) have leading/trailing slashes.
 *
 * Routes are generally relaxed towards slashes, but defaults
 * in router group (specified with `<Link to="path">`) must not
 * have leading slashes
 */

const HOME = '/';
const ROOT = '/*';
const FORMS = 'forms';
const OPERATIONS = '/operations';
const OPERATION = `${OPERATIONS}/:id`;
const OPERATION_FORMS = `${OPERATIONS}/:operationId/forms`;
const OPERATION_FORM_ASSIGNMENTS = 'w/:windowId';
const OPERATION_FORM_ASSIGNMENT_DATA = 'data/:assignmentId';
const OPERATION_CLUSTERS = `/clusters`;
const OPERATION_CLUSTER_MATCH = ':clusterId';
const OPERATION_CLUSTER = `${OPERATIONS}/:operationId/clusters/:clusterId`;
const REPORTING_WINDOW = 'w/';
const SETTINGS = `/settings`;
const ADMIN = '/admin';
const ACCESS = 'access';

const replacePlaceholders = (
  path: string,
  params: { [id: string]: string | number }
) => {
  for (const [param, value] of Object.entries(params)) {
    path = path.replace(`:${param}`, value.toString());
  }
  return path;
};

export const home: () => '/' = () => HOME;

export const root: () => '/*' = () => ROOT;

export const operations: () => '/operations' = () => OPERATIONS;

export const forms: () => 'forms' = () => FORMS;

export const formsRoot: () => 'forms/*' = () => `${FORMS}${ROOT}`;

/**
 * `/operations/:id`
 */
export const operation = (id: number) => replacePlaceholders(OPERATION, { id });

/**
 * `/operations/:id/*`
 */
export const operationRoot = () => OPERATION + ROOT;

/**
 * `/operations/:id/forms`
 */
export const operationForms = (id: number) =>
  replacePlaceholders(`${OPERATION}/${FORMS}`, { id });

/**
 * `/operations/:operationId/forms/w/:windowId`
 */
export const operationFormAssignments = (params: {
  operationId: number;
  windowId: number;
}) =>
  replacePlaceholders(
    `${OPERATION_FORMS}/${OPERATION_FORM_ASSIGNMENTS}`,
    params
  );

/**
 * `w/:windowId/*`
 */
export const formAssignmentsRoot = () => OPERATION_FORM_ASSIGNMENTS + ROOT;

/**
 * `/operations/:operationId/forms/w/:windowId/data/:assignmentId`
 */
export const operationFormAssignmentData = (params: {
  operationId: number;
  windowId: number;
  assignmentId: number;
}) =>
  replacePlaceholders(
    `${OPERATION_FORMS}/${OPERATION_FORM_ASSIGNMENTS}/${OPERATION_FORM_ASSIGNMENT_DATA}`,
    params
  );

export const formAssignmentDataMatch: () => 'data/:assignmentId' = () =>
  OPERATION_FORM_ASSIGNMENT_DATA;

/**
 * `/operations/:id/clusters`
 */
export const operationClusters = (id: number) =>
  replacePlaceholders(OPERATION + OPERATION_CLUSTERS, { id });

export const operationClustersRoot: () => '/clusters/*' = () =>
  `${OPERATION_CLUSTERS}${ROOT}`;

export const operationClusterMatch: () => ':clusterId/*' = () =>
  `${OPERATION_CLUSTER_MATCH}${ROOT}`;

/**
 * `/operations/:operationId/clusters/:clusterId`
 */
export const operationCluster = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER, params);

/**
 * `/operations/:operationId/clusters/:clusterId/forms/w/:windowId`
 */
export const operationClusterFormAssignments = (params: {
  operationId: number;
  clusterId: number;
  windowId: number;
}) =>
  replacePlaceholders(
    `${OPERATION_CLUSTER}/${FORMS}/${OPERATION_FORM_ASSIGNMENTS}`,
    params
  );

/**
 * `/operations/:operationId/clusters/:clusterId/forms/w/:windowId/data/:assignmentId`
 */
export const operationClusterFormAssignmentData = (params: {
  operationId: number;
  clusterId: number;
  windowId: number;
  assignmentId: number;
}) =>
  replacePlaceholders(
    `${OPERATION_CLUSTER}/${FORMS}/${OPERATION_FORM_ASSIGNMENTS}/${OPERATION_FORM_ASSIGNMENT_DATA}`,
    params
  );

/**
 * `/operations/:operationId/clusters/:clusterId/settings`
 */
export const operationClusterSettings = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER + SETTINGS, params);

/**
 * `/operations/:operationId/clusters/:clusterId/settings/access`
 */
export const operationClusterSettingsAccess = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER + SETTINGS + `/${ACCESS}`, params);

export const settingsRoot: () => '/settings/*' = () => `${SETTINGS}${ROOT}`;

/**
 * `/operations/:id/settings
 */
export const operationSettings = (id: number) =>
  replacePlaceholders(OPERATION + SETTINGS, { id });

/**
 * `/operations/:id/settings/access
 */
export const operationSettingsAccess = (id: number) =>
  replacePlaceholders(OPERATION + SETTINGS + `/${ACCESS}`, { id });

export const reportingWindow: () => 'w/' = () => REPORTING_WINDOW;

export const access: () => 'access' = () => ACCESS;

export const admin: () => '/admin' = () => ADMIN;

export const adminRoot: () => '/admin/*' = () => `${ADMIN}${ROOT}`;

export const adminAccess: () => '/admin/access' = () => `${ADMIN}/${ACCESS}`;
