import { FormMeta, Form } from './forms';

export interface ReportingWindow {
  id: number;
  name: string;
  /**
   * * `pending` - The window has not yet been opened for data entry, but can
   *   be given new assignments.
   * * `open` - The window is currently open to receive data entry.
   * * `closed` - The window is no longer open to data entry.
   */
  state: 'pending' | 'open' | 'closed';
}

export type AssignmentState =
  | 'not-entered'
  | 'raw:entered'
  | 'raw:finalized'
  | 'clean:entered'
  | 'clean:finalized';

export interface FormAssignment {
  assignmentId: number;
  state: AssignmentState;
  form: FormMeta;
}

export interface GetAssignmentsForOperationParams {
  reportingWindowId: number;
  operationId: number;
}

export interface GetAssignmentsForOperationResult {
  directAssignments: {
    forms: FormAssignment[];
  };
  clusterAssignments: Array<{
    clusterId: number;
    forms: FormAssignment[];
  }>;
}

export interface GetAssignmentParams {
  reportingWindowId: number;
  assignmentId: number;
}

export interface GetAssignmentResult {
  id: number;
  state: AssignmentState;
  /**
   * TODO: add additional tasks, such as indicators
   */
  task: {
    type: 'form';
    form: Form;
    /**
     * TODO: flesh this out with enketo data types
     */
    currentData: string;
  };
  assignee:
    | {
        type: 'operation';
        operationId: number;
      }
    | {
        type: 'operationCluster';
        clusterId: number;
      };
}

export interface Model {
  getAssignmentsForOperation(
    params: GetAssignmentsForOperationParams
  ): Promise<GetAssignmentsForOperationResult>;
  getAssignment(params: GetAssignmentParams): Promise<GetAssignmentResult>;
}
