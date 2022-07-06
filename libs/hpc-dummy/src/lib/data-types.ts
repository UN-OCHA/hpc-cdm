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

const EMERGENCY = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    date: t.string,
    active: t.boolean,
    restricted: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    description: t.union([t.string, t.null]),
    glideId: t.union([t.string, t.null]),
    levelThree: t.union([t.boolean, t.null]),
  }),
]);

const ENTITY_PROTOTYPE = t.type({
  id: t.number,
  refCode: t.string,
  value: t.intersection([
    t.type({
      name: t.type({
        en: t.type({
          singular: t.string,
          plural: t.string,
        }),
      }),
    }),
    t.partial({
      possibleChildren: t.union([
        t.array(
          t.type({
            refCode: t.string,
            cardinality: t.string,
            id: t.number,
          })
        ),
        t.null,
      ]),
    }),
  ]),
  type: t.string,
  planId: t.number,
  orderNumber: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const FIELD_CLUSTER = t.intersection([
  t.type({
    id: t.number,
    planId: t.number,
    entityPrototypeId: t.number,
    entityType: t.string,
    currentVersion: t.boolean,
    latestVersion: t.boolean,
    latestTaggedVersion: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
    governingEntityVersionId: t.number,
    governingEntityId: t.number,
    name: t.string,
    customReference: t.string,
    overriding: t.boolean,
    clusterNumber: t.string,
    entityPrototype: ENTITY_PROTOTYPE,
    value: t.union([
      t.type({
        icon: t.string,
        orderNumber: t.number,
      }),
      t.partial({ categories: t.union([t.array(t.unknown), t.null]) }),
    ]),
  }),
  t.partial({
    versionTags: t.union([t.array(t.string), t.null]),
    deletedAt: t.union([t.string, t.null]),
    tags: t.union([t.array(t.string), t.null]),
  }),
]);

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

const GLOBAL_CLUSTER = t.intersection([
  t.type({
    id: t.number,
    type: t.string,
    name: t.string,
    code: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    hrinfoId: t.union([t.number, t.null]),
    homepage: t.union([t.string, t.null]),
    defaultIconId: t.union([t.string, t.null]),
    parentId: t.union([t.number, t.null]),
    displayFTSSummariesFromYear: t.union([t.number, t.null]),
  }),
]);

const LOCATION_BASE = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    adminLevel: t.number,
    status: t.string,
    itosSync: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    externalId: t.union([t.string, t.null]),
    latitude: t.union([t.number, t.null]),
    longitude: t.union([t.number, t.null]),
    pcode: t.union([t.string, t.null]),
    iso3: t.union([t.string, t.null]),
    validOn: t.union([t.string, t.null]),
  }),
]);

const LOCATION_CHILD = t.intersection([
  LOCATION_BASE,
  t.type({
    parentId: t.number,
  }),
]);

const LOCATION = t.intersection([
  LOCATION_BASE,
  t.partial({
    parentId: t.union([t.number, t.null]),
    children: t.union([t.array(LOCATION_CHILD), t.null]),
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

const CATEGORY_REF = t.type({
  objectID: t.number,
  versionID: t.number,
  objectType: t.string,
  categoryID: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const CATEGORY = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    group: t.string,
    createdAt: t.string,
    updatedAt: t.string,
    categoryRef: CATEGORY_REF,
  }),
  t.partial({
    description: t.union([t.string, t.null]),
    parentID: t.union([t.number, t.null]),
    code: t.union([t.string, t.null]),
    includeTotals: t.union([t.boolean, t.null]),
  }),
]);

const ORGANIZATION = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    abbreviation: t.string,
    verified: t.boolean,
    active: t.boolean,
    collectiveInd: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    newOrganizationId: t.union([t.number, t.null]),
    nativeName: t.union([t.string, t.null]),
    url: t.union([t.string, t.null]),
    parentID: t.union([t.number, t.null]),
    comments: t.union([t.string, t.null]),
    notes: t.union([t.string, t.null]),
    deletedAt: t.union([t.string, t.null]),
    categories: t.union([t.array(CATEGORY), t.null]),
  }),
]);

const PLAN = t.intersection([
  t.type({
    id: t.number,
    restricted: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
    planVersionId: t.number,
    planId: t.number,
    name: t.string,
    startDate: t.string,
    endDate: t.string,
    isForHPCProjects: t.boolean,
    code: t.string,
    currentVersion: t.boolean,
    latestVersion: t.boolean,
    latestTaggedVersion: t.boolean,
  }),
  t.partial({
    revisionState: t.union([t.string, t.null]),
    comments: t.union([t.string, t.null]),
    customLocationCode: t.union([t.string, t.null]),
    currentReportingPeriodId: t.union([t.number, t.null]),
    lastPublishedReportingPeriodId: t.union([t.number, t.null]),
    clusterSelectionType: t.union([t.string, t.null]),
    versionTags: t.union([t.array(t.string), t.null]),
  }),
]);

const PROJECT = t.intersection([
  t.type({
    id: t.number,
    createdAt: t.string,
    updatedAt: t.string,
    latestVersionId: t.number,
    name: t.string,
    version: t.number,
    projectVersionCode: t.string,
    visible: t.boolean,
  }),
  t.partial({
    code: t.union([t.string, t.null]),
    creatorParticipantId: t.union([t.number, t.null]),
    currentPublishedVersionId: t.union([t.number, t.null]),
    implementationStatus: t.union([t.string, t.null]),
    pdf: t.union([
      t.partial({
        anonymous: t.partial({
          file: t.unknown,
          generatedAt: t.union([t.string, t.number]),
        }),
      }),
      t.null,
    ]),
    sourceProjectId: t.union([t.number, t.null]),
  }),
]);

const USAGE_YEAR = t.type({
  id: t.number,
  year: t.string,
  createdAt: t.string,
  updatedAt: t.string,
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
    emergencies: t.array(EMERGENCY),
    fieldClusters: t.array(FIELD_CLUSTER),
    flows: t.array(FLOW),
    globalClusters: t.array(GLOBAL_CLUSTER),
    locations: t.array(LOCATION),
    operations: t.array(OPERATION),
    operationClusters: t.array(OPERATION_CLUSTER),
    organizations: t.array(ORGANIZATION),
    plans: t.array(PLAN),
    projects: t.array(PROJECT),
    reportingWindows: t.array(REPORTING_WINDOW),
    usageYears: t.array(USAGE_YEAR),
    forms: t.array(FORM),
  },
  'DUMMY_DATA'
);

export type DummyData = t.TypeOf<typeof DUMMY_DATA>;
