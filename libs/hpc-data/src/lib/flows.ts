import * as t from 'io-ts';

import {
  DATE_FROM_STRING,
  NUMBER_FROM_STRING,
  POSITIVE_INTEGER_FROM_STRING,
} from './util';
import { ORGANIZATION } from './organizations';
import { CATEGORY } from './categories';
import { PDF } from './projects';
import { LOCATION_WITHOUT_CHILDREN } from './locations';
import { REPORT_DETAIL, SOURCE } from './report-details';
import { CREATE_FILE, REPORT_FILE_WITH_ENTITY } from './report-files';

const DIRECTION = t.union([t.literal('source'), t.literal('destination')]);

const FLOW_LIST = t.keyof({
  pending: null,
  all: null,
  search: null,
});

export type FlowList = t.TypeOf<typeof FLOW_LIST>;

const FLOW_OBJECT = t.intersection([
  t.type({
    objectID: t.number,
    refDirection: DIRECTION,
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

const FLOW_AUTOCOMPLETE_PROJECT = t.type({
  id: t.number,
  code: t.union([t.string, t.null]),
  currentPublishedVersionId: t.number,
  creatorParticipantId: t.union([t.number, t.null]),
  latestVersionId: t.number,
  implementationStatus: t.union([t.string, t.null]),
  flowObject: t.type({
    refDirection: DIRECTION,
  }),
  pdf: t.union([PDF, t.null]),
  projectVersions: t.array(
    t.type({
      name: t.string,
    })
  ),
  sourceProjectId: t.union([t.number, t.null]),
  visible: t.boolean,
});

const FLOW_AUTOCOMPLETE_FLOW_OBJECT = t.type({
  refDirection: DIRECTION,
});

const FLOW_AUTOCOMPLETE_DEFAULT_OBJECT = t.type({
  id: t.number,
  name: t.string,
  flowObject: FLOW_AUTOCOMPLETE_FLOW_OBJECT,
});

const FLOW_AUTOCOMPLETE_LOCATION = t.type({
  ...LOCATION_WITHOUT_CHILDREN.props,
  flowObject: FLOW_AUTOCOMPLETE_FLOW_OBJECT,
});

const FLOW_AUTOCOMPLETE_ORGANIZATION = t.type({
  ...FLOW_AUTOCOMPLETE_DEFAULT_OBJECT.props,
  abbreviation: t.string,
});

const FLOW_AUTOCOMPLETE_USAGE_YEAR = t.type({
  id: t.number,
  year: t.string,
  flowObject: FLOW_AUTOCOMPLETE_FLOW_OBJECT,
});

const FLOW_AUTOCOMPLETE_PLAN = t.type({
  id: t.number,
  flowObject: FLOW_AUTOCOMPLETE_FLOW_OBJECT,
  planVersion: t.type({
    name: t.string,
  }),
});

const FLOW_AUTOCOMPLETE_GOVERNING_ENTITY = t.type({
  id: t.number,
  flowObject: FLOW_AUTOCOMPLETE_FLOW_OBJECT,
  governingEntityVersion: t.type({
    name: t.string,
  }),
});

const PARENT_CHILDREN_FLOW = t.type({
  childID: t.number,
  createdAt: DATE_FROM_STRING,
  depth: t.number,
  parentID: t.number,
  updatedAt: DATE_FROM_STRING,
});

const FLOW_REST_REPORT_DETAIL = t.intersection([
  REPORT_DETAIL,
  t.type({
    categories: t.array(CATEGORY),
    organization: ORGANIZATION,
    reportFiles: t.array(REPORT_FILE_WITH_ENTITY),
  }),
]);

const FLOW_REST_WITHOUT_PARENTS_CHILDREN_CATEGORIES = t.intersection([
  t.type({
    id: t.number,
    versionID: t.number,
    amountUSD: t.string,
    flowDate: t.string,
    decisionDate: t.union([t.string, t.null]),
    firstReportedDate: t.union([t.string, t.null]), //  firstReportedDate is nullable in some old flows
    activeStatus: t.boolean,
    restricted: t.boolean,
    newMoney: t.boolean,
    description: t.string,
    plans: t.array(FLOW_AUTOCOMPLETE_PLAN),
    organizations: t.array(FLOW_AUTOCOMPLETE_ORGANIZATION),
    locations: t.array(FLOW_AUTOCOMPLETE_LOCATION),
    globalClusters: t.array(FLOW_AUTOCOMPLETE_DEFAULT_OBJECT),
    usageYears: t.array(FLOW_AUTOCOMPLETE_USAGE_YEAR),
    projects: t.array(FLOW_AUTOCOMPLETE_PROJECT),
    emergencies: t.array(FLOW_AUTOCOMPLETE_DEFAULT_OBJECT),
    governingEntities: t.array(FLOW_AUTOCOMPLETE_GOVERNING_ENTITY),
    clusters: t.array(FLOW_AUTOCOMPLETE_GOVERNING_ENTITY),
    planEntities: t.array(t.unknown),
    versionStartDate: t.union([t.string, t.null]), //  versionStartDate is nullable in some old flows,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    notes: t.union([t.string, t.null]),
    budgetYear: t.union([t.string, t.null]),
    origAmount: t.union([t.string, t.null]),
    origCurrency: t.union([t.string, t.null]),
    exchangeRate: t.union([t.string, t.null]),
    versionEndDate: t.union([t.string, t.null]),
    deletedAt: t.union([t.string, t.null]),
    lastUpdatedBy: t.union([CREATED_BY_OR_LAST_UPDATED_BY, t.null]),
    createdBy: t.union([CREATED_BY_OR_LAST_UPDATED_BY, t.null]),
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

/** Delete when finishing off REST flow endpoint (Maybe Matyas needs it) */
const FLOW_REST = t.intersection([
  FLOW_REST_WITHOUT_PARENTS_CHILDREN_CATEGORIES,
  t.type({
    children: t.array(PARENT_CHILDREN_FLOW),
    parents: t.array(PARENT_CHILDREN_FLOW),
    categories: t.array(CATEGORY),
    reportDetails: t.array(FLOW_REST_REPORT_DETAIL),
  }),
]);

export type FlowREST = t.TypeOf<typeof FLOW_REST>;

export const GET_FLOW_PARAMS = t.type({
  id: POSITIVE_INTEGER_FROM_STRING,
});

export type GetFlowParams = t.TypeOf<typeof GET_FLOW_PARAMS>;

const GET_FLOW_VERSION_PARAMS = t.type({
  id: POSITIVE_INTEGER_FROM_STRING,
  versionID: POSITIVE_INTEGER_FROM_STRING,
});

export type GetFlowVersionParams = t.TypeOf<typeof GET_FLOW_VERSION_PARAMS>;

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

const CHILDREN_TYPE = t.type({
  childID: t.union([t.number, t.string]),
  // origCurrency: t.union([t.string, t.null]),
});

const PARENT = t.type({
  child: t.union([t.string, t.number]),
  parentID: t.union([t.number, t.string]),
});

const PARENT_TYPE = t.intersection([
  t.type({
    parentID: t.number,
  }),
  t.partial({
    Parent: t.type({
      parentID: t.union([t.number, t.string]),
      origCurrency: t.union([t.string, t.null]),
    }),
    origCurrency: t.union([t.string, t.null]),
    childID: t.number,
    parents: t.array(PARENT),
    id: t.number,
  }),
]);

const CREATE_FLOW_REPORT_DETAIL = t.type({
  contactInfo: t.union([t.string, t.null]),
  source: SOURCE,
  date: t.union([t.string, t.null]),
  sourceID: t.union([t.number, t.null]),
  refCode: t.union([t.string, t.null]),
  verified: t.boolean,
  organizationID: t.union([t.number, t.null]),
  categories: t.array(t.number),
  newlyAdded: t.boolean,
  reportFiles: t.array(CREATE_FILE),
});

/**
 * TODO: This type was created by an old developer of the team, and we should
 * verify that they are all correctly typed.
 */
const CREATE_FLOW = t.intersection([
  t.type({
    activeStatus: t.boolean,
    amountUSD: NUMBER_FROM_STRING,
    categories: t.array(t.number),
    children: t.array(CHILDREN_TYPE),
    decisionDate: t.union([t.string, t.null]),
    description: t.string,
    firstReportedDate: t.string,
    flowDate: t.string,
    flowObjects: t.array(FLOW_OBJECT),
    isCancellation: t.union([t.boolean, t.null]),
    newCategories: t.array(t.number),
    newMoney: t.boolean,
    origCurrency: t.union([t.string, t.null]),
    parents: t.array(PARENT_TYPE),
    reportDetails: t.array(CREATE_FLOW_REPORT_DETAIL),
    restricted: t.boolean,
  }),
  t.partial({
    notes: t.string,
    pendingStatus: t.union([t.boolean, t.array(t.string)]),
    categorySources: t.array(t.unknown), // TODO: TO properly define type, here it was defined messy
    cancelled: t.union([t.boolean, t.null]), // TODO: Not always present
    childMethod: t.union([t.string, CHILD_METHOD_TYPE]), // TODO: Not sure, came from matyas
    planEntities: t.union([t.boolean, t.array(t.string)]), // TODO: Not always present
    planIndicated: t.union([t.boolean, t.array(t.string)]), // TODO: Not always present
    isApprovedFlowVersion: t.union([t.boolean, t.null]), // TODO: Not always present
    isErrorCorrection: t.union([t.boolean, t.null]), // TODO: Not always present
    inactiveReason: t.array(FLOW_FORM_FIELD), // TODO: Not always present
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
    budgetYear: t.number,
    origAmount: t.union([NUMBER_FROM_STRING, t.null]),
    exchangeRate: t.union([t.string, t.null]),
    versionStartDate: t.union([t.string, t.null]),
    versionEndDate: t.union([t.string, t.null]),
  }),
]);

const CREATE_FLOW_PARAMS = t.type({
  flow: CREATE_FLOW,
});

export type CreateFlowParams = t.TypeOf<typeof CREATE_FLOW_PARAMS>;

const UPDATE_FLOW_PARAMS = t.type({
  flow: t.intersection([
    CREATE_FLOW,
    t.type({
      id: t.number,
      versionID: t.number,
    }),
  ]),
});

export type UpdateFlowParams = t.TypeOf<typeof UPDATE_FLOW_PARAMS>;

// * GRAPHQL CODE FROM HERE *

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

export const GET_FLOWS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetFlowsAutocompleteParams = t.TypeOf<
  typeof GET_FLOWS_AUTOCOMPLETE_PARAMS
>;

export const GET_FLOWS_AUTOCOMPLETE_RESULT = t.array(
  FLOW_REST_WITHOUT_PARENTS_CHILDREN_CATEGORIES
);

export type GetFlowsAutocompleteResult = t.TypeOf<
  typeof GET_FLOWS_AUTOCOMPLETE_RESULT
>;
export interface Model {
  getFlowREST(params: GetFlowParams): Promise<GetFlowResult>;
  getFlowVersionREST(params: GetFlowVersionParams): Promise<GetFlowResult>;
  getFlow(params: GetFlowParams): Promise<GetFlowResult>;
  searchFlows(params: SearchFlowsParams): Promise<SearchFlowsResult>;
  bulkRejectPendingFlows(
    params: BulkRejectPendingFlowsParams
  ): Promise<BulkRejectPendingFlowsResults>;
  getFlowsDownloadXLSX(
    params: SearchFlowsParams
  ): Promise<SearchFlowsBatchesResult>;
  createFlow(params: CreateFlowParams): Promise<GetFlowResult>;
  updateFlow(params: UpdateFlowParams): Promise<GetFlowResult>;
  getAutocompleteFlows(
    params: GetFlowsAutocompleteParams
  ): Promise<GetFlowsAutocompleteResult>;
}
