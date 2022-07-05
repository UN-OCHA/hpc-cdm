import * as t from 'io-ts';

import { access, forms } from '@unocha/hpc-data';

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

const ACCESS = t.type(
  {
    active: t.array(
      t.type({
        target: access.ACCESS_TARGET,
        grantee: access.GRANTEE,
        roles: t.array(t.string),
      })
    ),
    invites: t.array(
      t.type({
        target: access.ACCESS_TARGET,
        email: t.string,
        roles: t.array(t.string),
        lastModifiedBy: t.number,
      })
    ),
    auditLog: t.array(
      t.type({
        target: access.ACCESS_TARGET,
        grantee: access.GRANTEE,
        actor: t.number,
        date: t.number,
        roles: t.array(t.string),
      })
    ),
  },
  'ACCESS'
);

const FORM_ASSIGNMENT = t.type({
  id: t.number,
  version: t.number,
  lastUpdatedAt: t.number,
  lastUpdatedBy: t.string,
  type: t.literal('form'),
  formId: t.number,
  assignee: ASSIGNEE,
  state: ASSIGNMENT_STATE,
  currentData: t.union([t.string, t.null]),
  currentFiles: t.array(
    t.type({
      name: t.string,
      // TODO: shall we store files in a different local storage?
      base64Data: t.string,
    })
  ),
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
  email: t.string,
});

export type User = t.TypeOf<typeof USER>;

const FLOW_REF_DIRECTION = t.keyof({
  source: null,
  destination: null,
});

const FLOW_CATEGORY = t.type({
  name: t.string,
  group: t.string,
});

const FLOW_ORGANIZATION = t.type({
  name: t.string,
  objectID: t.number,
  refDirection: FLOW_REF_DIRECTION,
});

const FLOW_LOCATION_OR_PLAN = t.type({
  name: t.string,
});

const FLOW_USAGE_YEAR = t.type({
  year: t.string,
  refDirection: FLOW_REF_DIRECTION,
});

const FLOW_REPORT_DETAIL = t.intersection([
  t.type({
    id: t.number,
    organizationID: t.number,
    source: t.string,
  }),
  t.partial({
    date: t.string,
    channel: t.union([t.string, t.null]),
    refCode: t.union([t.string, t.null]),
    sourceID: t.union([t.string, t.null]),
  }),
]);

const TRANSFERRED_ENTITY = t.type({
  key: t.string,
  valueId: t.number,
});

const INFERRED_ENTITY = t.type({
  key: t.string,
  valueId: t.number,
  reason: t.string,
});

const FLOW_EXTERNAL_REFERENCE = t.intersection([
  t.type({
    id: t.number,
    systemID: t.string,
    flowID: t.number,
    externalRecordID: t.string,
    externalRecordDate: t.string,
  }),
  t.partial({
    versionID: t.number,
    importInformation: t.partial({
      inferred: t.union([t.array(INFERRED_ENTITY), t.null]),
      transferred: t.union([t.array(TRANSFERRED_ENTITY), t.null]),
    }),
  }),
]);

const FLOW = t.intersection([
  t.type({
    id: t.number,
    versionID: t.number,
    amountUSD: t.string,
    updatedAt: t.string,
    activeStatus: t.boolean,
    restricted: t.boolean,
  }),
  t.partial({
    childIDs: t.union([t.array(t.number), t.null]),
    parentIDs: t.union([t.array(t.number), t.null]),
    categories: t.union([t.array(FLOW_CATEGORY), t.null]),
    organizations: t.union([t.array(FLOW_ORGANIZATION), t.null]),
    plans: t.union([t.array(FLOW_LOCATION_OR_PLAN), t.null]),
    locations: t.union([t.array(FLOW_LOCATION_OR_PLAN), t.null]),
    usageYears: t.union([t.array(FLOW_USAGE_YEAR), t.null]),
    reportDetails: t.union([t.array(FLOW_REPORT_DETAIL), t.null]),
    externalReference: t.union([FLOW_EXTERNAL_REFERENCE, t.null]),
    origAmount: t.union([t.string, t.null]),
    origCurrency: t.union([t.string, t.null]),
    parkedParentSource: t.type({
      organization: t.array(t.number),
      OrgName: t.array(t.string),
    }),
  }),
]);

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

const FORM = t.type(
  {
    id: t.number,
    version: t.number,
    name: t.string,
    definition: forms.FORM_DEFINITION,
  },
  'FORM'
);

export const DUMMY_DATA = t.type(
  {
    access: ACCESS,
    users: t.array(USER),
    currentUser: t.union([t.null, t.number]),
    flows: t.array(FLOW),
    operations: t.array(OPERATION),
    operationClusters: t.array(OPERATION_CLUSTER),
    reportingWindows: t.array(REPORTING_WINDOW),
    forms: t.array(FORM),
  },
  'DUMMY_DATA'
);

export type DummyData = t.TypeOf<typeof DUMMY_DATA>;
