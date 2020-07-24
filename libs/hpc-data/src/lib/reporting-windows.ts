import { FormMeta } from './forms';

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
}

export interface Model {
  getAssignmentsForOperation(
    params: GetAssignmentsForOperationParams
  ): Promise<GetAssignmentsForOperationResult>;
}
