export const HOME = '/';
export const OPERATIONS = '/operations';
export const OPERATION = `${OPERATIONS}/:id`;
export const OPERATION_FORMS = `${OPERATIONS}/:id/forms`;
export const OPERATION_CLUSTERS = `${OPERATIONS}/:id/clusters`;
export const OPERATION_SETTINGS = `${OPERATIONS}/:id/settings`;
export const ADMIN = '/admin';

export const operation = (id: number) =>
  OPERATION.replace(':id', id.toString());

export const operationForms = (id: number) =>
  OPERATION_FORMS.replace(':id', id.toString());

export const operationClusters = (id: number) =>
  OPERATION_CLUSTERS.replace(':id', id.toString());

export const operationSettings = (id: number) =>
  OPERATION_SETTINGS.replace(':id', id.toString());
