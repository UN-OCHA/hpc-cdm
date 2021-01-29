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
  permissions: t.type({
    canModifyAccess: t.boolean,
  }),
});

export type OperationCluster = t.TypeOf<typeof OPERATION_CLUSTER>;

export const DETAILED_OPERATION = t.intersection([
  OPERATION,
  t.type({
    /**
     * The list of reporting windows that are associated with the current operation.
     */
    reportingWindows: t.array(REPORTING_WINDOW),
    permissions: t.type({
      canModifyAccess: t.boolean,
      /**
       * Can modify the access and permissions of any of this operation's clusters
       */
      canModifyClusterAccessAndPermissions: t.boolean,
    }),
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

export const GET_OPERATION_RESULT = t.type({
  data: DETAILED_OPERATION,
});

export type GetOperationResult = t.TypeOf<typeof GET_OPERATION_RESULT>;

export const GET_CLUSTERS_PARAMS = t.type({
  operationId: INTEGER_FROM_STRING,
});

export type GetClustersParams = t.TypeOf<typeof GET_CLUSTERS_PARAMS>;

export const GET_CLUSTERS_RESULT = t.type({
  data: t.array(OPERATION_CLUSTER),
});

export type GetClustersResult = t.TypeOf<typeof GET_CLUSTERS_RESULT>;

export interface Model {
  getOperations(): Promise<GetOperationsResult>;
  getOperation(params: GetOperationParams): Promise<GetOperationResult>;
  getClusters(params: GetClustersParams): Promise<GetClustersResult>;
}
