import { ReportingWindow } from './reporting-windows';
import { ResultWithPermissions } from './util';

export interface Operation {
  id: number;
  name: string;
}

export interface DetailedOperation extends Operation {
  /**
   * The list of reporting windows that are associated with the current operation.
   */
  reportingWindows: ReportingWindow[];
}

export type GetOperationsResult = ResultWithPermissions<
  Operation[],
  'canAddOperation'
>;

export type GetOperationParams = {
  id: number;
};
export type GetOperationResult = ResultWithPermissions<
  DetailedOperation,
  never
>;

export interface Model {
  getOperations(): Promise<GetOperationsResult>;
  getOperation(params: GetOperationParams): Promise<GetOperationResult>;
}
