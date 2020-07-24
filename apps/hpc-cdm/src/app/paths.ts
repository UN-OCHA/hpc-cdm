export const HOME = '/';
export const OPERATIONS = '/operations';
export const OPERATION = `${OPERATIONS}/:id`;
export const OPERATION_FORMS = `${OPERATIONS}/:id/forms`;
export const OPERATION_FORM_ASSIGNMENTS = `${OPERATIONS}/:operationId/forms/:windowId`;
export const OPERATION_FORM_ASSIGNMENT_DATA = `${OPERATIONS}/:operationId/forms/:windowId/data/:assignmentId`;
export const OPERATION_CLUSTERS = `${OPERATIONS}/:id/clusters`;
export const OPERATION_SETTINGS = `${OPERATIONS}/:id/settings`;
export const ADMIN = '/admin';

const replacePlaceholders = (
  path: string,
  params: { [id: string]: string | number }
) => {
  for (const [param, value] of Object.entries(params)) {
    path = path.replace(`:${param}`, value.toString());
  }
  return path;
};

export const operation = (id: number) => replacePlaceholders(OPERATION, { id });

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

export const operationSettings = (id: number) =>
  replacePlaceholders(OPERATION_SETTINGS, { id });
