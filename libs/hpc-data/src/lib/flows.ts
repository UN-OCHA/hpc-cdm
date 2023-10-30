import * as t from 'io-ts';

import { INTEGER_FROM_STRING } from './util';

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

const FLOW_ORGANIZATION = t.type({
  objectID: t.number,
  refDirection: FLOW_REF_DIRECTION,
  name: t.string,
});

export type FlowOrganization = t.TypeOf<typeof FLOW_ORGANIZATION>;

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
    date: t.union([t.string, t.null]),
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
  valueId: t.union([t.number, t.null]),
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

const FLOW_SEARCH_RESULT = t.intersection([
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
    plans: t.union([t.array(FLOW_LOCATION), t.null]),
    locations: t.union([t.array(FLOW_PLAN), t.null]),
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

const COMPANY_GRAPHQL = t.type({
  id: t.string,
  name: t.string,
});
const PLAN_GRAPHQL = t.type({
  name: t.string,
  years: t.union([t.array(t.number), t.null]),
});
const SOURCE_GRAPHQL = t.type({
  organizations: t.union([t.array(COMPANY_GRAPHQL), t.null]),
});
const DESTINATION_GRAPHQL = t.type({
  organizations: t.union([t.array(COMPANY_GRAPHQL), t.null]),
  locations: t.union([t.array(COMPANY_GRAPHQL), t.null]),
  plans: t.union([t.array(PLAN_GRAPHQL), t.null]),
});
const FLOW_OBJECT_GRAPHQL = t.type({
  source: SOURCE_GRAPHQL,
  destination: DESTINATION_GRAPHQL,
});
const FLOW_SEARCH_GRAPHQL_RESULT = t.type({
  id: t.string,
  versionID: t.string,
  amountUSD: t.number,
  updatedAt: t.string,
  activeStatus: t.boolean,
  restricted: t.boolean,
  flowObjects: FLOW_OBJECT_GRAPHQL,
});
const CREATED_BY_OR_LAST_UPDATED_BY = t.type({
  name: t.string,
});

const FLOW = t.intersection([
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

export type Flow = t.TypeOf<typeof FLOW>;
const FLOW_GRAPHQL = t.intersection([
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

export type FlowGraphQL = t.TypeOf<typeof FLOW_GRAPHQL>;

export const GET_FLOW_PARAMS = t.type({
  id: INTEGER_FROM_STRING,
});

export type GetFlowParams = t.TypeOf<typeof GET_FLOW_PARAMS>;

export const GET_FLOW_RESULT = FLOW;

export type GetFlowResult = t.TypeOf<typeof GET_FLOW_RESULT>;

export type FlowSearchResult = t.TypeOf<typeof FLOW_SEARCH_RESULT>;

export type FlowSearchGraphQLResult = t.TypeOf<
  typeof FLOW_SEARCH_GRAPHQL_RESULT
>;

export const SEARCH_FLOWS_RESULT = t.type({
  flows: t.array(FLOW_SEARCH_RESULT),
  flowCount: t.string,
});

export type SearchFlowsResult = t.TypeOf<typeof SEARCH_FLOWS_RESULT>;

export const SEARCH_FLOWS_GRAPHQL_RESULT = t.type({
  searchFlow: t.array(FLOW_SEARCH_GRAPHQL_RESULT),
});

export type SearchFlowsGraphQLResult = t.TypeOf<
  typeof SEARCH_FLOWS_GRAPHQL_RESULT
>;

export const SEARCH_FLOWS_PARAMS = t.type({
  flowSearch: t.partial({
    activeStatus: t.type({
      name: t.string,
    }),
    flowID: t.number,
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
export type SearchFlowsParams = t.TypeOf<typeof SEARCH_FLOWS_PARAMS>;

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
  flowLegacyID: t.number,
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

export type FlowFilters = t.TypeOf<typeof FILTERS>;
export const SEARCH_FLOWS_GRAPHQL_PARAMS = t.type({
  flowSearch: t.partial({
    filters: FILTERS,
    limit: t.number,
    offset: t.number,
  }),
});
export type SearchFlowsGraphQlParams = t.TypeOf<
  typeof SEARCH_FLOWS_GRAPHQL_PARAMS
>;

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
export interface Model {
  getFlow(params: GetFlowParams): Promise<GetFlowResult>;
  getFlowGraphQL(params: GetFlowParams): Promise<GetFlowResult>;
  searchFlows(params: SearchFlowsParams): Promise<SearchFlowsResult>;
  searchFlowsGraphQL(
    params: SearchFlowsGraphQlParams
  ): Promise<SearchFlowsGraphQLResult>;
  bulkRejectPendingFlows(
    params: BulkRejectPendingFlowsParams
  ): Promise<BulkRejectPendingFlowsResults>;
}
