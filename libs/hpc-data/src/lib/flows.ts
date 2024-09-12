import * as t from 'io-ts';

import { POSITIVE_INTEGER_FROM_STRING } from './util';
import { ORGANIZATION } from './organizations';

const FLOW_REF_DIRECTION = t.keyof({
  source: null,
  destination: null,
});

const FLOW_LIST = t.keyof({
  pending: null,
  all: null,
  search: null,
});

export type FlowList = t.TypeOf<typeof FLOW_LIST>;

const FLOW_OBJECT = t.intersection([
  t.type({
    objectID: t.number,
    refDirection: FLOW_REF_DIRECTION,
    objectType: t.string,
  }),
  t.partial({
    flowID: t.number,
    versionID: t.number,
    behavior: t.union([t.string, t.null]),
    objectDetail: t.union([t.string, t.null]),
    createdAt: t.string,
    updatedAt: t.string,
  }),
]);

export type FlowObject = t.TypeOf<typeof FLOW_OBJECT>;

const FLOW_CATEGORY_REST = t.intersection([
  t.type({
    name: t.string,
    group: t.string,
  }),
  t.partial({
    id: t.number,
    createdAt: t.string,
    updatedAt: t.string,
    description: t.union([t.string, t.null]),
    parentID: t.union([t.number, t.null]),
    code: t.union([t.string, t.null]),
    includeTotals: t.union([t.boolean, t.null]),
    categoryRef: t.type({
      objectID: t.number,
      versionID: t.number,
      objectType: t.string,
      categoryID: t.number,
      createdAt: t.string,
      updatedAt: t.string,
    }),
  }),
]);
export type FlowCategory = t.TypeOf<typeof FLOW_CATEGORY_REST>;

const CREATED_BY_OR_LAST_UPDATED_BY = t.type({
  name: t.string,
});

/** Delete when finishing off REST flow endpoint (Maybe Matyas needs it) */
const FLOW_REST = t.intersection([
  t.type({
    id: t.number,
    versionID: t.number,
    amountUSD: t.string,
    flowDate: t.string,
    decisionDate: t.union([t.string, t.null]),
    firstReportedDate: t.string,
    activeStatus: t.boolean,
    restricted: t.boolean,
    newMoney: t.boolean,
    description: t.string,
    notes: t.string,
    versionStartDate: t.string,
    createdAt: t.string,
    updatedAt: t.string,
    meta: t.type({
      language: t.string,
    }),
    createdBy: t.union([CREATED_BY_OR_LAST_UPDATED_BY, t.null]),
    lastUpdatedBy: t.union([CREATED_BY_OR_LAST_UPDATED_BY, t.null]),
  }),
  t.partial({
    budgetYear: t.union([t.string, t.null]),
    origAmount: t.union([t.string, t.null]),
    origCurrency: t.union([t.string, t.null]),
    exchangeRate: t.union([t.string, t.null]),
    versionEndDate: t.union([t.string, t.null]),
    deletedAt: t.union([t.string, t.null]),
    legacy: t.union([
      t.type({
        createdAt: t.string,
        legacyID: t.number,
        objectID: t.number,
        objectType: t.string,
        updatedAt: t.string,
      }),
      t.null,
    ]),
  }),
]);

export type FlowREST = t.TypeOf<typeof FLOW_REST>;

export const GET_FLOW_PARAMS = t.type({
  id: POSITIVE_INTEGER_FROM_STRING,
});

export type GetFlowParams = t.TypeOf<typeof GET_FLOW_PARAMS>;

export const GET_FLOW_RESULT = FLOW_REST;

export type GetFlowResult = t.TypeOf<typeof GET_FLOW_RESULT>;

const FLOW_FORM_FIELD = t.type({
  group: t.string,
  id: t.number,
  name: t.string,
});

const CHILD_METHOD_TYPE = t.type({
  ...FLOW_FORM_FIELD.props,
  parentID: t.number,
});

const INACTIVE_REASON_TYPE = t.intersection([
  t.type({
    group: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    id: t.number,
    name: t.string,
  }),
]);

const CHILDREN_TYPE = t.type({
  childID: t.union([t.number, t.string]),
  origCurrency: t.union([t.string, t.null]),
});

const PARENT = t.type({
  child: t.union([t.string, t.number]),
  parentID: t.union([t.number, t.string]),
});

const PARENT_TYPE = t.intersection([
  t.type({
    id: t.number,
    Parent: t.type({
      parentID: t.union([t.number, t.string]),
      origCurrency: t.union([t.string, t.null]),
    }),
    origCurrency: t.union([t.string, t.null]),
  }),
  t.partial({
    childID: t.number,
    parents: t.array(PARENT),
    parentID: t.number,
  }),
]);

const FILE_ASSET_TYPE = t.type({
  collection: t.string,
  createAt: t.string,
  filename: t.string,
  id: t.number,
  mimetype: t.string,
  originalname: t.string,
  path: t.string,
  size: t.number,
  updatedAt: t.string,
});

const REPORT_FILE_TYPE = t.partial({
  title: t.string,
  fileName: t.string,
  UploadFileUrl: t.string,
  type: t.string,
  url: t.string,
  fileAssetID: t.number,
  size: t.number,
  fileAssetEntity: t.partial({ ...FILE_ASSET_TYPE.props }),
});

const CREATE_FLOW_REPORT_DETAIL = t.intersection([
  t.type({
    contactInfo: t.string,
    source: t.string,
    date: t.string,
    newlyAdded: t.boolean,
    sourceID: t.null,
    refCode: t.string,
    verified: t.boolean,
    organizationID: t.union([t.string, t.number]),
    categories: t.array(t.union([t.string, t.number])),
    organization: ORGANIZATION,
    reportFiles: t.array(REPORT_FILE_TYPE),
  }),
  t.partial({
    versionID: t.number,
  }),
]);

/**
 * TODO: This type was created by an old developer of the team, and we should
 * verify that they are all correctly typed.
 */
const CREATE_FLOW = t.intersection([
  t.type({
    activeStatus: t.boolean,
    amountUSD: t.number,
    categories: t.array(t.number),
    children: t.array(CHILDREN_TYPE),
    contributionTypes: FLOW_FORM_FIELD,
    decisionDate: t.union([t.string, t.null]),
    description: t.string,
    firstReportedDate: t.string,
    flowDate: t.string,
    flowObjects: t.array(FLOW_OBJECT),
    flowStatuses: FLOW_FORM_FIELD,
    flowType: FLOW_FORM_FIELD,
    isCancellation: t.union([t.boolean, t.null]),
    keywords: t.array(FLOW_FORM_FIELD),
    method: FLOW_FORM_FIELD,
    newCategories: t.array(t.number),
    newMoney: t.boolean,
    origCurrency: t.union([t.string, t.null]),
    parents: t.array(PARENT_TYPE),
    reportDetails: t.array(CREATE_FLOW_REPORT_DETAIL),
    restricted: t.boolean,
  }),
  t.partial({
    pendingStatus: t.union([t.boolean, t.array(t.string)]),
    categorySources: t.array(t.unknown), // TODO: TO properly define type, here it was defined messy
    cancelled: t.union([t.boolean, t.null]), // TODO: Not always present
    childMethod: t.union([t.string, CHILD_METHOD_TYPE]), // TODO: Not sure, came from matyas
    earmarking: t.union([FLOW_FORM_FIELD, t.null]),
    planEntities: t.union([t.boolean, t.array(t.string)]), // TODO: Not always present
    planIndicated: t.union([t.boolean, t.array(t.string)]), // TODO: Not always present
    isApprovedFlowVersion: t.union([t.boolean, t.null]), // TODO: Not always present
    isErrorCorrection: t.union([t.boolean, t.null]), // TODO: Not always present
    inactiveReason: t.array(INACTIVE_REASON_TYPE), // TODO: Not always present
    rejected: t.union([t.boolean, t.null]), // TODO: Not always present
    versions: t.array(
      t.type({
        id: t.number,
        versionID: t.number,
        activeStatus: t.union([t.boolean, t.undefined]),
        isPending: t.boolean,
        isCancelled: t.boolean,
      })
    ), // TODO: Not always present
    beneficiaryGroup: FLOW_FORM_FIELD, // TODO: Not always present
    budgetYear: t.string,
    origAmount: t.union([t.number, t.null]),
    exchangeRate: t.union([t.number, t.null]),
    versionStartDate: t.union([t.string, t.null]),
    versionEndDate: t.union([t.string, t.null]),
  }),
]);

const CREATE_FLOW_PARAMS = t.type({
  flow: CREATE_FLOW,
});

export type CreateFlowParams = t.TypeOf<typeof CREATE_FLOW_PARAMS>;

// * GRAPHQL CODE FROM HERE *

const DIRECTION = t.union([t.literal('source'), t.literal('destination')]);

const FLOW_LOCATION = t.type({
  id: t.number,
  name: t.string,
  direction: DIRECTION,
});

const FLOW_ORGANIZATION = t.type({
  id: t.number,
  direction: t.union([t.string, t.null, t.undefined]), // Accepts string or null/undefined
  name: t.string,
  abbreviation: t.string,
});

export type FlowOrganization = t.TypeOf<typeof FLOW_ORGANIZATION>;
const FLOW_USAGE_YEAR = t.type({
  year: t.string,
  direction: DIRECTION,
});

const FLOW_EXTERNAL_REFERENCE = t.type({
  systemID: t.string,
  flowID: t.number,
  externalRecordID: t.string,
  versionID: t.number,
  updatedAt: t.string,
});

const FLOW_REPORT_DETAIL = t.intersection([
  t.type({
    id: t.number,
    versionID: t.number,
    source: t.string,
    verified: t.boolean,
    updatedAt: t.string,
    createdAt: t.string,
  }),
  t.partial({
    flowID: t.number,
    date: t.union([t.string, t.null]),
    channel: t.union([t.string, t.null]),
    contactInfo: t.union([t.string, t.null]),
    sourceID: t.union([t.string, t.null]),
    refCode: t.union([t.string, t.null]),
    organizationID: t.number,
  }),
]);

const FLOW_PARKED_PARENT_SOURCE = t.type({
  organization: t.array(t.number),
  orgName: t.array(t.string),
});

const FLOW_CATEGORY_REF = t.type({
  objectID: t.number,
  versionID: t.number,
  objectType: t.string,
  categoryID: t.number,
  updatedAt: t.string,
});

const FLOW_CATEGORY = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    group: t.string,
    categoryRef: FLOW_CATEGORY_REF,
  }),
  t.partial({
    createdAt: t.string,
    updatedAt: t.string,
    description: t.string,
    parentID: t.union([t.number, t.null]),
    code: t.union([t.string, t.null]),
    includeTotals: t.union([t.boolean, t.null]),
  }),
]);

const FLOW_PLAN = t.type({
  id: t.number,
  name: t.string,
  direction: DIRECTION,
});

export const FLOW = t.intersection([
  t.type({
    id: t.number,
    versionID: t.number,
    amountUSD: t.string,
    updatedAt: t.string,
    activeStatus: t.boolean,
    restricted: t.boolean,
    externalReferences: t.array(FLOW_EXTERNAL_REFERENCE),
    reportDetails: t.array(FLOW_REPORT_DETAIL),
    newMoney: t.union([t.boolean, t.null]),
    decisionDate: t.union([t.string, t.null]),
    flowDate: t.union([t.string, t.null]),
    exchangeRate: t.union([t.string, t.null]),
    parkedParentSource: t.union([FLOW_PARKED_PARENT_SOURCE, t.null]),
  }),
  t.partial({
    description: t.string,
    budgetYear: t.string,
    locations: t.union([t.array(FLOW_LOCATION), t.null]),
    categories: t.union([t.array(FLOW_CATEGORY), t.null]),
    organizations: t.union([t.array(FLOW_ORGANIZATION), t.null]),
    destinationOrganizations: t.union([t.array(FLOW_ORGANIZATION), t.null]),
    sourceOrganizations: t.union([t.array(FLOW_ORGANIZATION), t.null]),
    plans: t.union([t.array(FLOW_PLAN), t.null]),
    usageYears: t.union([t.array(FLOW_USAGE_YEAR), t.null]),
    childIDs: t.union([t.array(t.number), t.null]),
    parentIDs: t.union([t.array(t.number), t.null]),
    origAmount: t.union([t.string, t.null]),
    origCurrency: t.union([t.string, t.null]),
  }),
]);

const FLOW_RESULT = t.array(FLOW);
export type Flow = t.TypeOf<typeof FLOW>;
export type FlowResult = t.TypeOf<typeof FLOW_RESULT>;

export const SEARCH_FLOWS_RESULT = t.type({
  searchFlows: t.type({
    total: t.number,
    flows: FLOW_RESULT,
    prevPageCursor: t.number,
    nextPageCursor: t.number,
    hasNextPage: t.boolean,
    hasPreviousPage: t.boolean,
    pageSize: t.number,
  }),
});

export type SearchFlowsResult = t.TypeOf<typeof SEARCH_FLOWS_RESULT>;

const FLOW_FILTERS = t.partial({
  flowFilters: t.partial({
    id: t.array(t.number),
    activeStatus: t.boolean,
    status: t.string,
    amountUSD: t.number,
    type: t.string,
    restricted: t.boolean,
  }),
  flowObjectFilters: t.array(
    t.union([
      t.type({
        objectID: t.number,
        direction: DIRECTION,
        objectType: t.string,
      }),
      t.partial({ inclusive: t.boolean }),
    ])
  ),
  commitment: t.boolean,
  carryover: t.boolean,
  paid: t.boolean,
  status: t.union([t.literal('updated'), t.literal('new')]),
  pledge: t.boolean,
  parked: t.boolean,
  pass_through: t.boolean,
  standard: t.boolean,
  flowCategoryFilters: t.array(t.type({ id: t.number, group: t.string })),
  pending: t.boolean,
  includeChildrenOfParkedFlows: t.boolean,
  nestedFlowFilters: t.partial({
    reporterRefCode: t.string,
    legacyID: t.number,
    sourceSystemID: t.string,
    systemID: t.string,
  }),
});

export type FlowFilters = t.TypeOf<typeof FLOW_FILTERS>;
const AbortSignalType = new t.Type<AbortSignal, AbortSignal, unknown>(
  'AbortSignal',
  (input: unknown): input is AbortSignal => input instanceof AbortSignal,
  (input, context) =>
    input instanceof AbortSignal ? t.success(input) : t.failure(input, context),
  t.identity
);

export const NESTED_FLOW_FILTERS = t.partial({
  reporterRefCode: t.string,
  legacyID: t.number,
  sourceSystemID: t.string,
});
export type NestedFlowFilters = t.TypeOf<typeof NESTED_FLOW_FILTERS>;

export const SEARCH_FLOWS_PARAMS = t.partial({
  limit: t.number,
  prevPageCursor: t.number,
  nextPageCursor: t.number,
  sortOrder: t.string,
  sortField: t.string,
  ...FLOW_FILTERS.props,
  signal: AbortSignalType,
});
export type SearchFlowsParams = t.TypeOf<typeof SEARCH_FLOWS_PARAMS>;

export const BULK_REJECT_PENDING_FLOWS_PARAMS = t.type({
  flows: t.array(
    t.type({
      id: t.number,
      versionID: t.number,
    })
  ),
});
export type BulkRejectPendingFlowsParams = t.TypeOf<
  typeof BULK_REJECT_PENDING_FLOWS_PARAMS
>;

export const BULK_REJECT_PENDING_FLOWS_RESULT = t.array(
  t.type({
    id: t.number,
    versionID: t.number,
  })
);

export type BulkRejectPendingFlowsResults = t.TypeOf<
  typeof BULK_REJECT_PENDING_FLOWS_RESULT
>;

export const SEARCH_FLOWS_BATCHES_RESULT = t.type({
  searchFlowsBatches: t.type({
    flows: FLOW_RESULT,
  }),
});
export type SearchFlowsBatchesResult = t.TypeOf<
  typeof SEARCH_FLOWS_BATCHES_RESULT
>;

export interface Model {
  getFlowREST(params: GetFlowParams): Promise<GetFlowResult>;
  getFlow(params: GetFlowParams): Promise<GetFlowResult>;
  searchFlows(params: SearchFlowsParams): Promise<SearchFlowsResult>;
  bulkRejectPendingFlows(
    params: BulkRejectPendingFlowsParams
  ): Promise<BulkRejectPendingFlowsResults>;
  getFlowsDownloadXLSX(
    params: SearchFlowsParams
  ): Promise<SearchFlowsBatchesResult>;
  createFlow(params: CreateFlowParams): Promise<GetFlowResult>;
}
