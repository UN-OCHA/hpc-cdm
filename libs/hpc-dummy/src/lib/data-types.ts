import * as t from 'io-ts';

/**
 * TODO: make into union of different assignee types
 */
const ASSIGNEE = t.union([
  t.type({
    type: t.literal('operation'),
    operationId: t.number,
  }),
  t.type({
    type: t.literal('operationCluster'),
    clusterId: t.number,
  }),
]);

const ASSIGNMENT_STATE = t.keyof({
  'not-entered': null,
  'raw:entered': null,
  'raw:finalized': null,
  'clean:entered': null,
  'clean:finalized': null,
});

const FORM_ASSIGNMENT = t.type({
  id: t.number,
  type: t.literal('form'),
  formId: t.number,
  assignee: ASSIGNEE,
  state: ASSIGNMENT_STATE,
  currentData: t.any,
  currentFiles: t.array(t.any),
});

/**
 * TODO: make into union of different assignment types
 */
const ASSIGNMENT = FORM_ASSIGNMENT;

export type Assignment = t.TypeOf<typeof ASSIGNMENT>;

const REPORTING_WINDOW = t.type({
  id: t.number,
  name: t.string,
  state: t.keyof({
    pending: null,
    open: null,
    closed: null,
  }),
  associations: t.type({
    operations: t.array(t.number),
  }),
  assignments: t.array(ASSIGNMENT),
});

const SESSION_USER = t.type({
  name: t.string,
});

const USER = t.type({
  id: t.number,
  user: SESSION_USER,
  permissions: t.array(t.string),
});

export type User = t.TypeOf<typeof USER>;

const OPERATION = t.type({
  id: t.number,
  name: t.string,
});

const OPERATION_CLUSTER = t.type({
  id: t.number,
  operationId: t.number,
  abbreviation: t.string,
  name: t.string,
});

const FORM = t.type({
  id: t.number,
  version: t.string,
  name: t.string,
  definition: t.any,
});

export const DUMMY_DATA = t.type({
  users: t.array(USER),
  currentUser: t.union([t.null, t.number]),
  operations: t.array(OPERATION),
  operationClusters: t.array(OPERATION_CLUSTER),
  reportingWindows: t.array(REPORTING_WINDOW),
  forms: t.array(FORM),
});

export type DummyData = t.TypeOf<typeof DUMMY_DATA>;
