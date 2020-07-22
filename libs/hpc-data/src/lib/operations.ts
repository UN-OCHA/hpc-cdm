import { ResultWithPermissions } from './util';

export namespace Operations {
  export interface Operation {
    id: number;
    name: string;
  }

  export type GetOperationsResult = ResultWithPermissions<
    Operation[],
    'canAddOperation'
  >;

  export interface Model {
    getOperations(): Promise<GetOperationsResult>;
  }
}
