import * as t from 'io-ts';
import { FORM_META, FORM, FORM_UPDATE_DATA, FORM_FILE } from './forms';
import { INTEGER_FROM_STRING, ARRAY_BUFFER } from './util';

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
  lastUpdatedAt: t.number,
  lastUpdatedBy: t.string,
  form: FORM_META,
});

export type FormAssignment = t.TypeOf<typeof FORM_ASSIGNMENT>;

export const GET_ASSIGNMENTS_FOR_OPERATION_PARAMS = t.type({
  reportingWindowId: INTEGER_FROM_STRING,
  operationId: INTEGER_FROM_STRING,
});

export type GetAssignmentsForOperationParams = t.TypeOf<
  typeof GET_ASSIGNMENTS_FOR_OPERATION_PARAMS
>;

export const CLUSTER_ASSIGNMENT = t.type({
  clusterId: t.number,
  forms: t.array(FORM_ASSIGNMENT),
});

export type ClusterAssignment = t.TypeOf<typeof CLUSTER_ASSIGNMENT>;

export const GET_ASSIGNMENTS_FOR_OPERATION_RESULT = t.type({
  directAssignments: t.type({
    forms: t.array(FORM_ASSIGNMENT),
  }),
  clusterAssignments: t.array(CLUSTER_ASSIGNMENT),
});

export type GetAssignmentsForOperationResult = t.TypeOf<
  typeof GET_ASSIGNMENTS_FOR_OPERATION_RESULT
>;

export const GET_ASSIGNMENT_PARAMS = t.type({
  assignmentId: INTEGER_FROM_STRING,
});

export type GetAssignmentParams = t.TypeOf<typeof GET_ASSIGNMENT_PARAMS>;

export const ASSIGNMENT_ASSIGNEE = t.union([
  t.type({
    type: t.literal('operation'),
    operationId: t.number,
  }),
  t.type({
    type: t.literal('operationCluster'),
    clusterId: t.number,
    clusterName: t.string,
  }),
]);

export type AssignmentAssignee = t.TypeOf<typeof ASSIGNMENT_ASSIGNEE>;

/**
 * Generic type used for both the model and real endpoints that provide this
 * data to allow for either a file hash of file contents to be returned
 */
export const GET_ASSIGNMENT_RESULT = <T>(fileType: t.Type<T>) =>
  t.type({
    id: t.number,
    version: t.number,
    /** UNIX Timestamp in milliseconds */
    lastUpdatedAt: t.number,
    /** Name of user that last updated this assignment */
    lastUpdatedBy: t.string,
    state: ASSIGNMENT_STATE,
    /**
     * True if the current user can edit this assignment in its current state
     */
    editable: t.boolean,
    /**
     * TODO: add additional tasks, such as indicators
     */
    task: t.type({
      type: t.literal('form'),
      form: FORM,
      currentData: t.union([t.string, t.null]),
      currentFiles: t.array(fileType),
    }),
    assignee: ASSIGNMENT_ASSIGNEE,
    assignedUsers: t.array(t.partial({ email: t.string, name: t.string })),
  });

export const GET_ASSIGNMENT_RESULT_MODEL = GET_ASSIGNMENT_RESULT(FORM_FILE);

export type GetAssignmentResult = t.TypeOf<typeof GET_ASSIGNMENT_RESULT_MODEL>;

export const UPDATE_ASSIGNMENT_PARAMS_VALUES = t.type({
  assignmentId: INTEGER_FROM_STRING,
  /**
   * Supply the last-known version number of the assignment.
   *
   * This is used to determine whether the assignment has already changed since
   * the user started editing data.
   */
  previousVersion: t.number,
  form: FORM_UPDATE_DATA,
});

export const UPDATE_ASSIGNMENT_PARAMS_STATE_CHANGE = t.type({
  assignmentId: INTEGER_FROM_STRING,
  state: ASSIGNMENT_STATE,
});

export const UPDATE_ASSIGNMENT_PARAMS = t.union([
  UPDATE_ASSIGNMENT_PARAMS_VALUES,
  UPDATE_ASSIGNMENT_PARAMS_STATE_CHANGE,
]);

export type UpdateAssignmentParams = t.TypeOf<typeof UPDATE_ASSIGNMENT_PARAMS>;

export const CHECK_FILES_PARAMS = t.type({
  fileHashes: t.array(t.string),
});

export type CheckFilesParams = t.TypeOf<typeof CHECK_FILES_PARAMS>;

export const CHECK_FILES_RESULT = t.type({
  missingFileHashes: t.array(t.string),
});

export type CheckFilesResult = t.TypeOf<typeof CHECK_FILES_RESULT>;

export const UPLOAD_ASSIGNMENT_FILE_RESULT = t.type({
  fileHash: t.string,
});

export type UploadAssignmentFileResult = t.TypeOf<
  typeof UPLOAD_ASSIGNMENT_FILE_RESULT
>;

export const DOWNLOAD_ASSIGNMENT_FILE_PARAMS = t.type({
  assignmentId: INTEGER_FROM_STRING,
  fileHash: t.string,
});

export type DownloadAssignmentFileParams = t.TypeOf<
  typeof DOWNLOAD_ASSIGNMENT_FILE_PARAMS
>;

export const DOWNLOAD_ASSIGNMENT_FILE_RESULT = ARRAY_BUFFER;

export type DownloadAssignmentFileResult = t.TypeOf<
  typeof DOWNLOAD_ASSIGNMENT_FILE_RESULT
>;

export interface Model {
  getAssignmentsForOperation(
    params: GetAssignmentsForOperationParams
  ): Promise<GetAssignmentsForOperationResult>;
  getAssignment(params: GetAssignmentParams): Promise<GetAssignmentResult>;
  updateAssignment(
    params: UpdateAssignmentParams
  ): Promise<GetAssignmentResult>;
}
