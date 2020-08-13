import * as t from 'io-ts';
import { FORM_META, FORM, FORM_UPDATE_DATA, FORM_FILE } from './forms';

export const REPORTING_WINDOW = t.type({
  // TODO
  id: t.number,
  name: t.string,
  /**
   * * `pending` - The window has not yet been opened for data entry, but can
   *   be given new assignments.
   * * `open` - The window is currently open to receive data entry.
   * * `closed` - The window is no longer open to data entry.
   */
  state: t.keyof({
    pending: null,
    open: null,
    closed: null,
  }),
});

export type ReportingWindow = t.TypeOf<typeof REPORTING_WINDOW>;

export const ASSIGNMENT_STATE = t.keyof({
  'not-entered': null,
  'raw:entered': null,
  'raw:finalized': null,
  'clean:entered': null,
  'clean:finalized': null,
});

export type AssignmentState = t.TypeOf<typeof ASSIGNMENT_STATE>;

const FORM_ASSIGNMENT = t.type({
  assignmentId: t.number,
  state: ASSIGNMENT_STATE,
  form: FORM_META,
});

export type FormAssignment = t.TypeOf<typeof FORM_ASSIGNMENT>;

export const GET_ASSIGNMENTS_FOR_OPERATION_PARAMS = t.type({
  reportingWindowId: t.number,
  operationId: t.number,
});

export type GetAssignmentsForOperationParams = t.TypeOf<
  typeof GET_ASSIGNMENTS_FOR_OPERATION_PARAMS
>;

export const GET_ASSIGNMENTS_FOR_OPERATION_RESULT = t.type({
  directAssignments: t.type({
    forms: t.array(FORM_ASSIGNMENT),
  }),
  clusterAssignments: t.array(
    t.type({
      clusterId: t.number,
      forms: t.array(FORM_ASSIGNMENT),
    })
  ),
});

export type GetAssignmentsForOperationResult = t.TypeOf<
  typeof GET_ASSIGNMENTS_FOR_OPERATION_RESULT
>;

export const GET_ASSIGNMENT_PARAMS = t.type({
  reportingWindowId: t.number,
  assignmentId: t.number,
});

export type GetAssignmentParams = t.TypeOf<typeof GET_ASSIGNMENT_PARAMS>;

export const GET_ASSIGNMENT_RESULT = t.type({
  id: t.number,
  state: ASSIGNMENT_STATE,
  /**
   * TODO: add additional tasks, such as indicators
   */
  task: t.type({
    type: t.literal('form'),
    form: FORM,
    currentData: t.union([t.string, t.null]),
    currentFiles: t.array(FORM_FILE),
  }),
  assignee: t.union([
    t.type({
      type: t.literal('operation'),
      operationId: t.number,
    }),
    t.type({
      type: t.literal('operationCluster'),
      clusterId: t.number,
      clusterName: t.string,
    }),
  ]),
});

export type GetAssignmentResult = t.TypeOf<typeof GET_ASSIGNMENT_RESULT>;

export const UPDATE_ASSIGNMENT_PARAMS = t.type({
  reportingWindowId: t.number,
  assignmentId: t.number,
  form: FORM_UPDATE_DATA,
});

export type UpdateAssignmentParams = t.TypeOf<typeof UPDATE_ASSIGNMENT_PARAMS>;

export interface Model {
  getAssignmentsForOperation(
    params: GetAssignmentsForOperationParams
  ): Promise<GetAssignmentsForOperationResult>;
  getAssignment(params: GetAssignmentParams): Promise<GetAssignmentResult>;
  updateAssignment(
    params: UpdateAssignmentParams
  ): Promise<GetAssignmentResult>;
}
