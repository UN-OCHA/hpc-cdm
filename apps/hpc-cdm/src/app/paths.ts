const HOME = '/';
const OPERATIONS = '/operations';
const OPERATION = `${OPERATIONS}/:id`;
const OPERATION_FORMS = `${OPERATIONS}/:id/forms`;
const OPERATION_FORM_ASSIGNMENTS = `${OPERATIONS}/:operationId/forms/w/:windowId`;
const OPERATION_FORM_ASSIGNMENT_DATA = `${OPERATIONS}/:operationId/forms/w/:windowId/data/:assignmentId`;
const OPERATION_CLUSTERS = `${OPERATIONS}/:id/clusters`;
const OPERATION_CLUSTER = `${OPERATIONS}/:operationId/clusters/:clusterId`;
const OPERATION_CLUSTER_FORMS = `${OPERATIONS}/:operationId/clusters/:clusterId/forms`;
const OPERATION_CLUSTER_FORM_ASSIGNMENTS = `${OPERATIONS}/:operationId/clusters/:clusterId/forms/w/:windowId`;
const OPERATION_CLUSTER_FORM_ASSIGNMENT_DATA = `${OPERATIONS}/:operationId/clusters/:clusterId/forms/w/:windowId/data/:assignmentId`;
const OPERATION_CLUSTER_SETTINGS = `${OPERATIONS}/:operationId/clusters/:clusterId/settings`;
const OPERATION_SETTINGS = `${OPERATIONS}/:id/settings`;
const OPERATION_SETTINGS_ACCESS = `${OPERATIONS}/:id/settings/access`;
const ADMIN = '/admin';

const replacePlaceholders = (
  path: string,
  params: { [id: string]: string | number }
) => {
  for (const [param, value] of Object.entries(params)) {
    path = path.replace(`:${param}`, value.toString());
  }
  return path;
};

export const home = () => replacePlaceholders(HOME, {});

export const operations = () => replacePlaceholders(OPERATIONS, {});

export const operation = (id: number) => replacePlaceholders(OPERATION, { id });

export const operationMatch = () => replacePlaceholders(OPERATION, {});

export const operationForms = (id: number) =>
  replacePlaceholders(OPERATION_FORMS, { id });

export const operationFormAssignments = (params: {
  operationId: number;
  windowId: number;
}) => replacePlaceholders(OPERATION_FORM_ASSIGNMENTS, params);

export const operationFormAssignmentsMatch = (params: {
  operationId: number;
}) => replacePlaceholders(OPERATION_FORM_ASSIGNMENTS, params);

export const operationFormAssignmentData = (params: {
  operationId: number;
  windowId: number;
  assignmentId: number;
}) => replacePlaceholders(OPERATION_FORM_ASSIGNMENT_DATA, params);

export const operationFormAssignmentDataMatch = (params: {
  operationId: number;
  windowId: number;
}) => replacePlaceholders(OPERATION_FORM_ASSIGNMENT_DATA, params);

export const operationClusters = (id: number) =>
  replacePlaceholders(OPERATION_CLUSTERS, { id });

export const operationCluster = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER, params);

export const operationClusterMatch = (params: { operationId: number }) =>
  replacePlaceholders(OPERATION_CLUSTER, params);

export const operationClusterForms = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER_FORMS, params);

export const operationClusterFormAssignments = (params: {
  operationId: number;
  clusterId: number;
  windowId: number;
}) => replacePlaceholders(OPERATION_CLUSTER_FORM_ASSIGNMENTS, params);

export const operationClusterFormAssignmentsMatch = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER_FORM_ASSIGNMENTS, params);

export const operationClusterFormAssignmentData = (params: {
  operationId: number;
  clusterId: number;
  windowId: number;
  assignmentId: number;
}) => replacePlaceholders(OPERATION_CLUSTER_FORM_ASSIGNMENT_DATA, params);

export const operationClusterFormAssignmentDataMatch = (params: {
  operationId: number;
  clusterId: number;
  windowId: number;
}) => replacePlaceholders(OPERATION_CLUSTER_FORM_ASSIGNMENT_DATA, params);

export const operationClusterSettings = (params: {
  operationId: number;
  clusterId: number;
}) => replacePlaceholders(OPERATION_CLUSTER_SETTINGS, params);

export const operationSettings = (id: number) =>
  replacePlaceholders(OPERATION_SETTINGS, { id });

export const operationSettingsAccess = (id: number) =>
  replacePlaceholders(OPERATION_SETTINGS_ACCESS, { id });

export const admin = () => replacePlaceholders(ADMIN, {});
