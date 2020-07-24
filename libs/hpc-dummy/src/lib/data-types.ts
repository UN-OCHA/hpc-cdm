import * as t from 'io-ts';

/**
 * TODO: make into union of different assignee types
 */
const ASSIGNEE = t.type({
  type: t.literal('operation'),
  operationId: t.number,
});

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
  currentData: t.string,
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

const OPERATION = t.type({
  id: t.number,
  name: t.string,
});

const FORM = t.type({
  id: t.number,
  name: t.string,
  definition: t.string,
});

export const DUMMY_DATA = t.type({
  currentUser: t.union([
    t.null,
    t.type({
      user: SESSION_USER,
      permissions: t.array(t.string),
    }),
  ]),
  operations: t.array(OPERATION),
  reportingWindows: t.array(REPORTING_WINDOW),
  forms: t.array(FORM),
});

export type DummyData = t.TypeOf<typeof DUMMY_DATA>;
