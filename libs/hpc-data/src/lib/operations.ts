import * as t from 'io-ts';

import { REPORTING_WINDOW } from './reporting-windows';
import { resultWithPermissions, INTEGER_FROM_STRING } from './util';

export const OPERATION = t.type({
  id: t.number,
  name: t.string,
});

export type Operation = t.TypeOf<typeof OPERATION>;

export const OPERATION_CLUSTER = t.type({
  id: t.number,
  abbreviation: t.string,
  name: t.string,
});

export type OperationCluster = t.TypeOf<typeof OPERATION_CLUSTER>;

export const DETAILED_OPERATION = t.intersection([
  OPERATION,
  t.type({
    /**
     * The list of reporting windows that are associated with the current operation.
     */
    reportingWindows: t.array(REPORTING_WINDOW),
  }),
]);

export type DetailedOperation = t.TypeOf<typeof DETAILED_OPERATION>;

export const GET_OPERATIONS_RESULT = resultWithPermissions(
  t.array(OPERATION),
  t.type({
    canAddOperation: t.boolean,
  })
);

export type GetOperationsResult = t.TypeOf<typeof GET_OPERATIONS_RESULT>;

export const GET_OPERATION_PARAMS = t.type({
  id: INTEGER_FROM_STRING,
});

export type GetOperationParams = t.TypeOf<typeof GET_OPERATION_PARAMS>;

export const GET_OPERATION_RESULT = resultWithPermissions(
  DETAILED_OPERATION,
  t.type({})
);

export type GetOperationResult = t.TypeOf<typeof GET_OPERATION_RESULT>;

export const GET_CLUSTERS_PARAMS = t.type({
  operationId: INTEGER_FROM_STRING,
});

export type GetClustersParams = t.TypeOf<typeof GET_CLUSTERS_PARAMS>;

export const GET_CLUSTERS_RESULT = resultWithPermissions(
  t.array(OPERATION_CLUSTER),
  t.type({})
);

export type GetClustersResult = t.TypeOf<typeof GET_CLUSTERS_RESULT>;

export interface Model {
  getOperations(): Promise<GetOperationsResult>;
  getOperation(params: GetOperationParams): Promise<GetOperationResult>;
  getClusters(params: GetClustersParams): Promise<GetClustersResult>;
}
