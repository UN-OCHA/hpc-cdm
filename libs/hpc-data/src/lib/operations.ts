import { ResultWithPermissions } from './util';

export interface Operation {
  id: number;
  name: string;
}

export type GetOperationsResult = ResultWithPermissions<
  Operation[],
  'canAddOperation'
>;

export type GetOperationParams = {
  id: number;
};
export type GetOperationResult = ResultWithPermissions<Operation, never>;

export interface Model {
  getOperations(): Promise<GetOperationsResult>;
  getOperation(params: GetOperationParams): Promise<GetOperationResult>;
}
