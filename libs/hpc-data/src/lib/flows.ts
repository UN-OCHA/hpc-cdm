import * as t from 'io-ts';

import { INTEGER_FROM_STRING } from './util';
import { CATEGORY } from './categories';
import { ORGANIZATION } from './organizations';
import { LOCATION_REST } from './locations';
import { USAGE_YEAR } from './usageYears';
import { GLOBAL_CLUSTER } from './global-clusters';
import { EMERGENCY } from './emergencies';
import { PROJECT_DETAIL } from './projects';
import { PLAN_DETAIL } from './plans';
import { FLOW_OBJECT } from './flowObject';

const FLOW_REF_DIRECTION = t.keyof({
  source: null,
  destination: null,
});

const FLOW_LIST = t.keyof({
  pending: null,
  all: null,
  search: null,
});

const FORM_FIELD = t.type({
  id: t.union([t.string, t.number]),
  name: t.string,
});

export type FlowList = t.TypeOf<typeof FLOW_LIST>;

export type FlowObject = t.TypeOf<typeof FLOW_OBJECT>;

const FLOW_CATEGORY = t.intersection([
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
export type FlowCategory = t.TypeOf<typeof FLOW_CATEGORY>;

const FLOW_ORGANIZATION_REST = t.type({
  objectID: t.number,
  refDirection: FLOW_REF_DIRECTION,
  name: t.string,
});
export type FlowOrganizationREST = t.TypeOf<typeof FLOW_ORGANIZATION_REST>;

const FLOW_LOCATION = t.type({
  name: t.string,
});

const FLOW_PLAN = t.type({
  name: t.string,
});

const FLOW_USAGE_YEAR = t.type({
  year: t.string,
  refDirection: FLOW_REF_DIRECTION,
});

const FLOW_REPORT_DETAIL = t.intersection([
  t.type({
    id: t.number,
    organizationID: t.union([t.number, t.null]),
    source: t.string,
  }),
  t.partial({
    verified: t.string,
    contactInfo: t.union([t.string, t.null]),
    date: t.union([t.string, t.null]),
    channel: t.union([t.string, t.null]),
    refCode: t.union([t.string, t.null]),
    sourceID: t.union([t.string, t.null]),
    categories: t.array(CATEGORY),
    organization: t.type({
      id: t.number,
      name: t.string,
      abbreviation: t.string,
    }),
    reportFiles: t.array(
      t.type({
        id: t.number,
        title: t.string,
      })
    ),
    reportFileTitle: t.string,
    reportUrlTitle: t.string,
    reportUrl: t.string,
  }),
]);

export type FlowReportDetail = t.TypeOf<typeof FLOW_REPORT_DETAIL>;

const TRANSFERRED_ENTITY = t.type({
  key: t.string,
  valueId: t.number,
});

const INFERRED_ENTITY = t.type({
  key: t.string,
  valueId: t.union([t.number, t.null]),
  reason: t.string,
});

export const FLOW_EXTERNAL_REFERENCE = t.intersection([
  t.type({
    id: t.number,
    systemID: t.string,
    flowID: t.number,
    externalRecordID: t.string,
    externalRecordDate: t.union([t.string, t.null]),
  }),
  t.partial({
    versionID: t.union([t.number, t.null]),
    importInformation: t.union([
      t.partial({
        inferred: t.union([t.array(INFERRED_ENTITY), t.null]),
        transferred: t.union([t.array(TRANSFERRED_ENTITY), t.null]),
      }),
      t.null,
    ]),
  }),
]);

export type FlowExternalReference = t.TypeOf<typeof FLOW_EXTERNAL_REFERENCE>;

export const FLOW_EXTERNAL_DATA = t.type({
  id: t.number,
  data: t.string,
  objectType: t.string,
  refDirection: t.string,
});

export type FlowExternalData = t.TypeOf<typeof FLOW_EXTERNAL_DATA>;

const FLOW_SEARCH_RESULT_REST = t.intersection([
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
    // TO REMOVE
    organizations: t.union([t.array(FLOW_ORGANIZATION_REST), t.null]),
    destinationOrganizations: t.union([
      t.array(FLOW_ORGANIZATION_REST),
      t.null,
    ]),
    sourceOrganizations: t.union([t.array(FLOW_ORGANIZATION_REST), t.null]),
    plans: t.union([t.array(FLOW_PLAN), t.null]),
    locations: t.union([t.array(FLOW_LOCATION), t.null]),
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

const CREATED_BY_OR_LAST_UPDATED_BY = t.type({
  name: t.string,
});

/** Delete when finishing off REST flow endpoint */
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
    updatedAtDisplay: t.string,
    createdAtDisplay: t.string,
    meta: t.type({
      language: t.string,
    }),
    createdBy: t.union([CREATED_BY_OR_LAST_UPDATED_BY, t.null]),
    lastUpdatedBy: t.union([CREATED_BY_OR_LAST_UPDATED_BY, t.null]),
    categories: t.array(CATEGORY),
    organizations: t.array(ORGANIZATION),
    locations: t.array(LOCATION_REST),
    usageYears: t.array(USAGE_YEAR),
    versions: t.array(FLOW_SEARCH_RESULT_REST),
    reportDetails: t.array(FLOW_REPORT_DETAIL),
    flowObjects: t.array(FLOW_OBJECT),
    parents: t.array(
      t.type({
        childID: t.number,
        parentID: t.number,
        depth: t.number,
        createdAt: t.string,
        updatedAt: t.string,
      })
    ),
    children: t.array(
      t.type({
        childID: t.number,
        parentID: t.number,
        depth: t.number,
        createdAt: t.string,
        updatedAt: t.string,
      })
    ),
  }),
  t.partial({
    budgetYear: t.union([t.string, t.null]),
    origAmount: t.union([t.string, t.null]),
    origCurrency: t.union([t.string, t.null]),
    exchangeRate: t.union([t.string, t.null]),
    globalClusters: t.array(GLOBAL_CLUSTER),
    emergencies: t.array(EMERGENCY),
    projects: t.array(PROJECT_DETAIL),
    plans: t.array(PLAN_DETAIL),
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
    externalReferences: t.array(t.union([FLOW_EXTERNAL_REFERENCE, t.null])),
    externalData: t.array(t.union([FLOW_EXTERNAL_DATA, t.null])),
  }),
]);

export type FlowREST = t.TypeOf<typeof FLOW_REST>;

export const GET_FLOW_PARAMS = t.intersection([
  t.type({
    id: INTEGER_FROM_STRING,
  }),
  t.partial({
    versionId: INTEGER_FROM_STRING,
  }),
]);

export type GetFlowParams = t.TypeOf<typeof GET_FLOW_PARAMS>;

export const GET_FLOW_RESULT = FLOW_REST;

export type GetFlowResult = t.TypeOf<typeof GET_FLOW_RESULT>;

export type FlowSearchResult = t.TypeOf<typeof FLOW_SEARCH_RESULT_REST>;

export const SEARCH_FLOWS_RESULT_REST = t.type({
  flows: t.array(FLOW_SEARCH_RESULT_REST),
  flowCount: t.string,
});

export type SearchFlowsResultREST = t.TypeOf<typeof SEARCH_FLOWS_RESULT_REST>;
const FlowLocation = t.type({
  id: t.number,
  name: t.string,
  direction: t.string,
});

// NEW CODE FROM HERE
const FlowOrganization = t.type({
  id: t.number,
  direction: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  name: t.string,
  abbreviation: t.string,
});

export type FlowOrganization = t.TypeOf<typeof FlowOrganization>;
const FlowUsageYear = t.type({
  year: t.string,
  direction: t.string,
});

const FlowExternalReference = t.type({
  systemID: t.string,
  flowID: t.number,
  externalRecordID: t.string,
  versionID: t.number,
  updatedAt: t.string,
});

const FlowReportDetail = t.type({
  id: t.number,
  versionID: t.number,
  source: t.string,
  date: t.union([t.string, t.null]),
  verified: t.boolean,
  channel: t.union([t.string, t.null]),
  updatedAt: t.string,
  contactInfo: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  sourceID: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  refCode: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  organizationID: t.union([t.number, t.null, t.undefined]), // accepts number or null/undefined
});

const FlowParkedParentSource = t.type({
  organization: t.array(t.number),
  orgName: t.array(t.string),
});

const FlowCategoryRef = t.type({
  objectID: t.number,
  versionID: t.number,
  objectType: t.string,
  categoryID: t.number,
  updatedAt: t.string,
});

const FlowCategory = t.type({
  id: t.number,
  name: t.string,
  group: t.string,
  createdAt: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  updatedAt: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  description: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  parentID: t.union([t.number, t.null, t.undefined]), // accepts number or null/undefined
  code: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  includeTotals: t.union([t.boolean, t.null, t.undefined]), // accepts boolean or null/undefined
  categoryRef: FlowCategoryRef,
});

const FlowPlan = t.type({
  id: t.number,
  name: t.string,
  direction: t.string,
});

const FLOW = t.type({
  id: t.number,
  versionID: t.number,
  amountUSD: t.string,
  updatedAt: t.string,
  activeStatus: t.boolean,
  restricted: t.boolean,
  locations: t.union([t.array(FlowLocation), t.null, t.undefined]),
  categories: t.union([t.array(FlowCategory), t.null, t.undefined]),
  organizations: t.union([t.array(FlowOrganization), t.null, t.undefined]),
  plans: t.union([t.array(FlowPlan), t.null, t.undefined]),
  usageYears: t.union([t.array(FlowUsageYear), t.null, t.undefined]),
  childIDs: t.union([t.array(t.number), t.null, t.undefined]),
  parentIDs: t.union([t.array(t.number), t.null, t.undefined]), // accepts an array of numbers or null/undefined
  origAmount: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  origCurrency: t.union([t.string, t.null, t.undefined]), // accepts string or null/undefined
  externalReferences: t.array(FlowExternalReference),
  reportDetails: t.array(FlowReportDetail),
  parkedParentSource: t.union([FlowParkedParentSource, t.null]),
  newMoney: t.union([t.boolean, t.null]),
  decisionDate: t.union([t.string, t.null]),
  flowDate: t.union([t.string, t.null]),
  exchangeRate: t.union([t.string, t.null]),
  description: t.string,
  budgetYear: t.string,
});

export const FLOW_RESULT = t.array(FLOW);
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

export const VALIDATION_RESULT = t.type({
  success: t.string,
  checked: t.string,
  message: t.string,
  confirmed: t.union([t.string, t.null]),
});
export type ValidationResult = t.TypeOf<typeof VALIDATION_RESULT>;
export const VALIDATE_FLOW_RESULT = t.array(VALIDATION_RESULT);

export type SearchFlowsResult = t.TypeOf<typeof SEARCH_FLOWS_RESULT>;

export const SEARCH_FLOWS_REST_PARAMS = t.type({
  flowSearch: t.partial({
    activeStatus: t.type({
      name: t.string,
    }),
    flowID: t.array(t.number),
    amountUSD: t.number,
    flowList: FLOW_LIST,
    active: t.boolean,
    orderBy: t.string,
    orderDir: t.union([t.string, t.null]),
    allReportDetails: t.boolean,
    categories: t.array(FLOW_CATEGORY),
    flowObjects: t.array(FLOW_OBJECT),
    includeChildrenOfParkedFlows: t.boolean,
    limit: t.number,
    offset: t.number,
  }),
});
export type SearchFlowsRESTParams = t.TypeOf<typeof SEARCH_FLOWS_REST_PARAMS>;

const FILTERS = t.partial({
  destinationCountries: t.array(t.string),
  destinationOrganizations: t.array(t.string),
  destinationUsageYears: t.array(t.string),
  destinationProjects: t.array(t.string),
  destinationPlans: t.array(t.string),
  destinationGlobalClusters: t.array(t.string),
  destinationEmergencies: t.array(t.string),
  amountUSD: t.number,
  flowID: t.string,
  flowStatus: t.string,
  flowType: t.string,
  flowActiveStatus: t.string,
  status: t.string,
  reporterRefCode: t.number,
  sourceSystemID: t.number,
  legacyID: t.number,
  keywords: t.array(t.string),
  sourceCountries: t.array(t.string),
  sourceOrganizations: t.array(t.string),
  sourceUsageYears: t.array(t.string),
  sourceProjects: t.array(t.string),
  sourcePlans: t.array(t.string),
  sourceGlobalClusters: t.array(t.string),
  sourceEmergencies: t.array(t.string),
  includeChildrenOfParkedFlows: t.boolean,
});

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
    t.type({ objectID: t.number, direction: t.string, objectType: t.string })
  ),
  commitment: t.boolean,
  carryover: t.boolean,
  paid: t.boolean,
  pledged: t.boolean,
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
  }),
});
// TODO: transform to arrays of
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

export type FlowFiltersREST = t.TypeOf<typeof FILTERS>;
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

export const GET_TOTAL_AMOUNT_USD_PARAMS = t.partial({
  ...FLOW_FILTERS.props,
  signal: AbortSignalType,
});
export type GetTotalAmountUSDParams = t.TypeOf<
  typeof GET_TOTAL_AMOUNT_USD_PARAMS
>;

export const GET_TOTAL_AMOUNT_USD_RESULT = t.type({
  searchFlowsTotalAmountUSD: t.type({
    totalAmountUSD: t.string,
  }),
});
export type GetTotalAmountUSDResult = t.TypeOf<
  typeof GET_TOTAL_AMOUNT_USD_RESULT
>;

export const GET_FLOWS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetFlowsAutocompleteParams = t.TypeOf<
  typeof GET_FLOWS_AUTOCOMPLETE_PARAMS
>;

export const FUNDING_DETAIL = t.type({
  governingEntity: t.array(FORM_FIELD),
  location: t.array(FORM_FIELD),
  organization: t.array(FORM_FIELD),
  project: t.array(FORM_FIELD),
  usageYear: t.array(FORM_FIELD),
  globalCluster: t.array(FORM_FIELD),
  emergency: t.array(FORM_FIELD),
  plan: t.array(FORM_FIELD),
});

export const GET_VALIDATE_FLOWS_PARAMS = t.type({
  id: t.union([t.string, t.null]),
  amountUSD: t.number,
  flowDate: t.string,
  decisionDate: t.union([t.string, t.null]),
  firstReportedDate: t.string,
  budgetYear: t.string,
  categories: t.array(t.string),
  origAmount: t.union([t.number, t.null]),
  origCurrency: t.string,
  exchangeRate: t.union([t.number, t.null]),
  activeStatus: t.boolean,
  restricted: t.boolean,
  newMoney: t.boolean,
  description: t.string,
  versionStartDate: t.string,
  versionEndDate: t.string,
  flowObjects: t.array(FLOW_OBJECT),
  children: t.any,
  parents: t.any,
  reportDetails: t.any,
  flowType: FORM_FIELD,
  keywords: t.array(FORM_FIELD),
  flowStatuses: FORM_FIELD,
  contributionTypes: FORM_FIELD,
  method: FORM_FIELD,
  earmarking: t.union([FORM_FIELD, t.null]),
  isCancellation: t.union([t.boolean, t.null]),
  src: FUNDING_DETAIL,
  dest: FUNDING_DETAIL,
});

export type GetValidateFlowParams = t.TypeOf<typeof GET_VALIDATE_FLOWS_PARAMS>;

export const CREATE_FLOW = t.type({
  flow: GET_VALIDATE_FLOWS_PARAMS,
});

export const CREATE_FLOW_OPTION = t.type({
  adding: t.boolean,
  originalFlow: t.any,
});

export type CreateFlowParams = t.TypeOf<typeof CREATE_FLOW>;
export type CreateFlowOptions = t.TypeOf<typeof CREATE_FLOW_OPTION>;

export interface Model {
  getFlowREST(params: GetFlowParams): Promise<GetFlowResult>;
  getFlow(params: GetFlowParams): Promise<GetFlowResult>;
  searchFlowsREST(
    params: SearchFlowsRESTParams
  ): Promise<SearchFlowsResultREST>;
  searchFlows(params: SearchFlowsParams): Promise<SearchFlowsResult>;
  bulkRejectPendingFlows(
    params: BulkRejectPendingFlowsParams
  ): Promise<BulkRejectPendingFlowsResults>;
  getTotalAmountUSD(
    params: GetTotalAmountUSDParams
  ): Promise<GetTotalAmountUSDResult>;
  getAutocompleteFlows(params: GetFlowsAutocompleteParams): Promise<FlowResult>;
  validateFlow(
    params: GetValidateFlowParams,
    options: CreateFlowOptions
  ): Promise<ValidationResult[]>;
  createFlow(params: CreateFlowParams): Promise<FlowREST>;
  updateFlow(params: CreateFlowParams): Promise<FlowREST>;
}
