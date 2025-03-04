import * as t from 'io-ts';

import { CATEGORY, CATEGORY_WITH_CATEGORY_REF } from './categories';
import { CATEGORY_REF } from './category-refs';
import { EMERGENCY } from './emergencies';
import { ENTITY_PROTOTYPE_REF_CODE } from './entity-prototypes';
import { EXTERNAL_DATA } from './external-data';
import { EXTERNAL_REFERENCE } from './external-references';
import { FLOW_LINK } from './flow-links';
import { FLOW_OBJECT, FLOW_OBJECT_REF_DIRECTION } from './flow-objects';
import { GLOBAL_CLUSTER } from './global-clusters';
import {
  GOVERNING_ENTITY,
  GOVERNING_ENTITY_VERSION,
} from './governing-entities';
import { LEGACY } from './legacy';
import { LOCATION } from './locations';
import { ORGANIZATION_MODEL } from './organizations';
import { PLAN_ENTITY } from './plan-entities';
import { PLAN_ENTITY_VERSION } from './plan-entity-versions';
import { PLAN_VERSION } from './plan-versions';
import { PLAN } from './plans';
import { PROJECT_VERSION } from './project-versions';
import { PROJECT, PROJECT_PDF } from './projects';
import { REPORT_DETAIL } from './report-details';
import { CREATE_FILE, REPORT_FILE_WITH_ENTITY } from './report-files';
import { USAGE_YEAR } from './usageYears';
import {
  DATE_FROM_STRING,
  INTEGER_FROM_STRING,
  NUMBER_FROM_STRING,
  optional,
  POSITIVE_INTEGER_FROM_STRING,
} from './util';

export const FLOW = t.type({
  id: t.number,
  amountUSD: INTEGER_FROM_STRING,
  versionID: t.number,
  activeStatus: t.boolean,
  restricted: t.boolean,
  newMoney: t.boolean,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  deletedAt: optional(DATE_FROM_STRING),
  flowDate: optional(DATE_FROM_STRING),
  decisionDate: optional(DATE_FROM_STRING),
  firstReportedDate: optional(DATE_FROM_STRING),
  budgetYear: optional(t.string),
  origAmount: optional(INTEGER_FROM_STRING),
  origCurrency: optional(t.string),
  exchangeRate: optional(NUMBER_FROM_STRING),
  description: optional(t.string),
  notes: optional(t.string),
  versionStartDate: optional(DATE_FROM_STRING),
  versionEndDate: optional(DATE_FROM_STRING),
});
const {
  id,
  versionID,
  activeStatus,
  amountUSD,
  budgetYear,
  decisionDate,
  description,
  exchangeRate,
  firstReportedDate,
  flowDate,
  newMoney,
  notes,
  origAmount,
  origCurrency,
  restricted,
  versionEndDate,
  versionStartDate,
  createdAt,
  updatedAt,
  deletedAt,
} = {
  ...FLOW.props,
};
export type Flow = t.TypeOf<typeof FLOW>;

const CREATED_BY_OR_LAST_UPDATED_BY = t.type({
  /* TODO: IN db participant name could be null, but there are no null.
   * We should migrate to non-nullable
   */
  name: optional(t.string),
});

const FLOW_AUTOCOMPLETE_PROJECT = t.type({
  id: t.number,
  code: optional(t.string),
  currentPublishedVersionId: t.number,
  creatorParticipantId: optional(t.number),
  latestVersionId: t.number,
  implementationStatus: optional(t.string),
  flowObject: t.type({
    refDirection: FLOW_OBJECT_REF_DIRECTION,
  }),
  pdf: optional(PROJECT_PDF),
  projectVersions: t.array(
    t.type({
      name: t.string,
    })
  ),
  sourceProjectId: optional(t.number),
  visible: t.boolean,
});

const FLOW_AUTOCOMPLETE_FLOW_OBJECT = t.type({
  refDirection: FLOW_OBJECT_REF_DIRECTION,
});

const FLOW_AUTOCOMPLETE_DEFAULT_OBJECT = t.type({
  id: t.number,
  name: t.string,
  flowObject: FLOW_AUTOCOMPLETE_FLOW_OBJECT,
});

const FLOW_AUTOCOMPLETE_LOCATION = t.type({
  ...LOCATION.props,
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

const FLOW_AUTOCOMPLETE = t.intersection([
  FLOW,
  t.type({
    categories: t.array(CATEGORY),
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
  }),
  t.partial({
    lastUpdatedBy: optional(CREATED_BY_OR_LAST_UPDATED_BY),
    createdBy: optional(CREATED_BY_OR_LAST_UPDATED_BY),
    legacy: optional(LEGACY),
  }),
]);

export const GET_FLOW_PARAMS = t.intersection([
  t.type({ id: POSITIVE_INTEGER_FROM_STRING }),
  t.partial({
    versionID: POSITIVE_INTEGER_FROM_STRING,
    shouldIncludeAllVersionsReportDetails: t.boolean,
  }),
]);
type GetFlowParams = t.TypeOf<typeof GET_FLOW_PARAMS>;

const GET_FLOW_REPORT_DETAIL = t.type({
  ...REPORT_DETAIL.props,
  categories: t.array(
    t.type({
      ...CATEGORY.props,
      categoryRef: CATEGORY_REF,
    })
  ),
  reportFiles: t.array(REPORT_FILE_WITH_ENTITY),
  organization: optional(ORGANIZATION_MODEL),
});

const getFlowEntityFlowObject = <T extends t.Props>(ENTITY: t.TypeC<T>) =>
  t.type({ ...ENTITY.props, flowObject: FLOW_OBJECT });

const getFlowEntityWithVersionFlowObject = <
  T extends t.Props,
  K extends t.Props,
  L extends 'planVersion' | 'planEntityVersion',
>(
  entity: t.TypeC<T>,
  entityVersion: t.TypeC<K>,
  entityVersionName: L
) =>
  t.type({
    ...getFlowEntityFlowObject(entity).props,
    [entityVersionName]: entityVersion,
  }) as t.TypeC<
    T & { flowObject: typeof FLOW_OBJECT } & {
      [key in L]: t.TypeC<K>;
    }
  >;

const GET_FLOW_ORGANIZATION = t.type({
  ...getFlowEntityFlowObject(ORGANIZATION_MODEL).props,
  categories: t.array(
    t.type({
      id: CATEGORY.props.id,
      name: CATEGORY.props.name,
      group: CATEGORY.props.group,
    })
  ),
});

const GET_FLOW_PROJECT = t.type({
  ...getFlowEntityFlowObject(PROJECT).props,
  projectVersions: t.array(PROJECT_VERSION),
  visible: t.boolean,
});

const GET_FLOW_GOVERNING_ENTITY = t.type({
  ...getFlowEntityFlowObject(GOVERNING_ENTITY).props,
  governingEntityVersion: t.type({
    ...GOVERNING_ENTITY_VERSION.props,
    clusterNumber: t.string,
  }),
  entityType: optional(ENTITY_PROTOTYPE_REF_CODE),
});

const GET_FLOW_VERSION = t.type({
  id,
  versionID,
  activeStatus,
  createdAt,
  updatedAt,
  deletedAt,
  categories: t.array(
    t.type({
      versionID,
      categoryID: CATEGORY_REF.props.categoryID,
    })
  ),
});

export const GET_FLOW_RESULT = t.type({
  ...FLOW.props,
  categories: t.array(CATEGORY),
  flowObjects: t.array(FLOW_OBJECT),
  children: t.array(FLOW_LINK),
  /**
   * @deprecated
   * Use `parent` instead, as it's correctly typed
   */
  parents: t.array(FLOW_LINK),
  // TODO: Remove undefined when rewritten endpoint is added
  parent: t.union([optional(FLOW_LINK), t.undefined]),
  externalReferences: t.array(EXTERNAL_REFERENCE),
  externalData: t.array(EXTERNAL_DATA),
  reportDetails: t.array(GET_FLOW_REPORT_DETAIL),
  anonymizedOrganizations: t.array(ORGANIZATION_MODEL),
  /**
   * @deprecated
   * Use `governingEntities` instead, as cluster is a duplication
   * to support legacy use
   */
  clusters: t.array(GET_FLOW_GOVERNING_ENTITY),
  emergencies: t.array(getFlowEntityFlowObject(EMERGENCY)),
  globalClusters: t.array(getFlowEntityFlowObject(GLOBAL_CLUSTER)),
  governingEntities: t.array(GET_FLOW_GOVERNING_ENTITY),
  locations: t.array(getFlowEntityFlowObject(LOCATION)),
  plans: t.array(
    getFlowEntityWithVersionFlowObject(PLAN, PLAN_VERSION, 'planVersion')
  ),
  planEntities: t.array(
    getFlowEntityWithVersionFlowObject(
      PLAN_ENTITY,
      PLAN_ENTITY_VERSION,
      'planEntityVersion'
    )
  ),
  projects: t.array(GET_FLOW_PROJECT),
  organizations: t.array(GET_FLOW_ORGANIZATION),
  usageYears: t.array(getFlowEntityFlowObject(USAGE_YEAR)),
  versions: t.array(GET_FLOW_VERSION),
  legacy: optional(LEGACY),
  createdBy: optional(CREATED_BY_OR_LAST_UPDATED_BY),
  lastUpdatedBy: optional(CREATED_BY_OR_LAST_UPDATED_BY),
});

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
      origCurrency: optional(t.string),
    }),
    origCurrency: optional(t.string),
    childID: t.number,
    parents: t.array(PARENT),
    id: t.number,
  }),
]);

const {
  id: _reportDetailId,
  versionID: _reportDetailVersionID,
  flowID: _reportDetailFlowID,
  updatedAt: _reportDetailUpdatedAt,
  createdAt: _reportDetailCreatedAt,
  ...reportDetailProps
} = REPORT_DETAIL.props;
const CREATE_FLOW_REPORT_DETAIL = t.type({
  ...reportDetailProps,
  categories: t.array(t.number),
  newlyAdded: t.boolean,
  reportFiles: t.array(CREATE_FILE),
});

const { objectID, objectType, behavior, refDirection } = FLOW_OBJECT.props;
const CREATE_FLOW_OBJECT = t.type({
  objectID,
  objectType,
  behavior,
  refDirection,
});
const CREATE_FLOW = t.intersection([
  t.type({
    activeStatus,
    amountUSD,
    categories: t.array(t.number),
    children: t.array(CHILDREN_TYPE),
    decisionDate,
    description: t.string,
    firstReportedDate: DATE_FROM_STRING,
    flowDate: DATE_FROM_STRING,
    flowObjects: t.array(CREATE_FLOW_OBJECT),
    isCancellation: optional(t.boolean),
    newCategories: t.array(t.number),
    newMoney,
    origCurrency,
    parents: t.array(PARENT_TYPE),
    reportDetails: t.array(CREATE_FLOW_REPORT_DETAIL),
    restricted,
  }),
  t.partial({
    notes,
    pendingStatus: t.union([t.boolean, t.array(t.string)]),
    cancelled: optional(t.boolean),
    childMethod: t.union([t.string, CHILD_METHOD_TYPE]),
    planEntities: t.union([t.boolean, t.array(t.string)]),
    planIndicated: t.union([t.boolean, t.array(t.string)]),
    isApprovedFlowVersion: optional(t.boolean),
    isErrorCorrection: optional(t.boolean),
    inactiveReason: t.array(FLOW_FORM_FIELD),
    rejected: optional(t.boolean),
    versions: t.array(
      t.type({
        id: t.number,
        versionID: t.number,
        activeStatus: t.union([t.boolean, t.undefined]),
        isPending: t.boolean,
        isCancelled: t.boolean,
      })
    ),
    budgetYear: t.number,
    origAmount,
    exchangeRate,
    versionStartDate,
    versionEndDate,
  }),
]);

export const CREATE_FLOW_PARAMS = t.type({
  flow: CREATE_FLOW,
});

export type CreateFlowParams = t.TypeOf<typeof CREATE_FLOW_PARAMS>;

const {
  lastUpdatedBy: _lastUpdatedBy,
  createdBy: _createdBy,
  versions: _versions,
  legacy: _legacy,
  ...otherGetFlowProps
} = GET_FLOW_RESULT.props;

const { categories: _categories, ...createFlowOrganizationProps } =
  GET_FLOW_ORGANIZATION.props;
export const CREATE_FLOW_RESULT = t.type({
  ...otherGetFlowProps,
  // `organizations` on create flow doesn't contain `categories`
  organizations: t.array(t.type(createFlowOrganizationProps)),
});

type CreateFlowResult = t.TypeOf<typeof CREATE_FLOW_RESULT>;

export const UPDATE_FLOW_PARAMS = t.type({
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
  direction: FLOW_OBJECT_REF_DIRECTION,
});

const FLOW_ORGANIZATION = t.type({
  id: t.number,
  direction: t.union([FLOW_OBJECT_REF_DIRECTION, t.null, t.undefined]), // Accepts string or null/undefined
  name: t.string,
  abbreviation: t.string,
});

export type FlowOrganization = t.TypeOf<typeof FLOW_ORGANIZATION>;
const FLOW_USAGE_YEAR = t.type({
  year: t.string,
  direction: FLOW_OBJECT_REF_DIRECTION,
});

const FLOW_REPORT_DETAIL = t.intersection([
  REPORT_DETAIL,
  t.partial({
    channel: optional(t.string),
  }),
]);

const FLOW_PARKED_PARENT_SOURCE = t.type({
  organization: t.array(t.number),
  orgName: t.array(t.string),
});

const FLOW_PLAN = t.type({
  id: t.number,
  name: t.string,
  direction: FLOW_OBJECT_REF_DIRECTION,
});
const { deletedAt: _deletedAt, ...V4_FLOW_PROPS } = FLOW.props;
const {
  id: _externalReferenceId,
  importInformation: _externalImportInformation,
  ...V4_EXTERNAL_REFERENCES_PROPS
} = EXTERNAL_REFERENCE.props;
export const FLOW_V4 = t.type({
  ...V4_FLOW_PROPS,
  externalReferences: t.array(t.type(V4_EXTERNAL_REFERENCES_PROPS)),
  reportDetails: t.array(FLOW_REPORT_DETAIL),
  locations: t.array(FLOW_LOCATION),
  organizations: t.array(FLOW_ORGANIZATION),
  destinationOrganizations: t.array(FLOW_ORGANIZATION),
  sourceOrganizations: t.array(FLOW_ORGANIZATION),
  plans: t.array(FLOW_PLAN),
  usageYears: t.array(FLOW_USAGE_YEAR),
  childIDs: t.array(t.number),
  parentIDs: t.array(t.number),
  categories: optional(t.array(CATEGORY_WITH_CATEGORY_REF)),
  parkedParentSource: optional(FLOW_PARKED_PARENT_SOURCE),
});

export const GET_FLOW_V4_PARAMS = t.type({
  id: t.number,
});

type GetFlowV4Params = t.TypeOf<typeof GET_FLOW_V4_PARAMS>;

export const GET_FLOW_V4_RESULT = t.array(FLOW_V4);
export type FlowV4 = t.TypeOf<typeof FLOW_V4>;

type GetFlowV4Result = t.TypeOf<typeof GET_FLOW_V4_RESULT>;

export const SEARCH_FLOWS_RESULT = t.type({
  searchFlows: t.type({
    total: t.number,
    flows: GET_FLOW_V4_RESULT,
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
        direction: FLOW_OBJECT_REF_DIRECTION,
        objectType: t.string,
      }),
      t.partial({ inclusive: t.boolean }),
    ])
  ),
  commitment: t.boolean,
  carryover: t.boolean,
  paid: t.boolean,
  status: t.keyof({ updated: null, new: null }),
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

export const NESTED_FLOW_FILTERS = t.partial({
  reporterRefCode: t.string,
  legacyID: t.number,
  sourceSystemID: t.string,
});
export type NestedFlowFilters = t.TypeOf<typeof NESTED_FLOW_FILTERS>;

export const SEARCH_FLOWS_PARAMS = t.partial({
  limit: t.number,
  page: t.number,
  sortOrder: t.string,
  sortField: t.string,
  ...FLOW_FILTERS.props,
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
    flows: GET_FLOW_V4_RESULT,
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

export const GET_FLOWS_AUTOCOMPLETE_RESULT = t.array(FLOW_AUTOCOMPLETE);

export type GetFlowsAutocompleteResult = t.TypeOf<
  typeof GET_FLOWS_AUTOCOMPLETE_RESULT
>;

export const DELETE_FLOW_PARAMS = t.type({
  flowId: t.number,
  versionID: t.number,
});

export type DeleteFlowParams = t.TypeOf<typeof DELETE_FLOW_PARAMS>;

export const DELETE_FLOW_RESULT = t.string;

export type DeleteFlowResult = t.TypeOf<typeof DELETE_FLOW_RESULT>;

export const COMPARE_FLOWS_PARAMS = t.type({
  flowIdA: t.number,
  versionIdA: t.number,
  flowIdB: t.number,
  versionIdB: t.number,
});

export type CompareFlowsParams = t.TypeOf<typeof COMPARE_FLOWS_PARAMS>;

const STATE = t.keyof({
  addition: 'addition',
  deletion: 'deletion',
  noop: 'noop',
});
const COMPARE_FLOW_OBJECT = t.type({
  id: t.number,
  name: t.string,
  direction: FLOW_OBJECT_REF_DIRECTION,
  state: STATE,
});
export type State = t.TypeOf<typeof STATE>;

const COMPARE_FLOW = t.intersection([
  t.type({
    flowId: t.number,
    versionId: t.number,
    flowObjects: t.partial({
      plans: t.array(
        t.intersection([
          COMPARE_FLOW_OBJECT,
          t.type({ shortName: optional(t.string), code: t.string }),
        ])
      ),
      projects: t.array(
        t.intersection([COMPARE_FLOW_OBJECT, t.type({ code: t.string })])
      ),
      anonymizedOrganizations: t.array(
        t.intersection([
          COMPARE_FLOW_OBJECT,
          t.type({ abbreviation: t.string }),
        ])
      ),
      organizations: t.array(
        t.intersection([
          COMPARE_FLOW_OBJECT,
          t.type({ abbreviation: t.string }),
        ])
      ),
      usageYears: t.array(
        t.type({
          id: t.number,
          year: INTEGER_FROM_STRING,
          direction: FLOW_OBJECT_REF_DIRECTION,
          state: STATE,
        })
      ),
      locations: t.array(COMPARE_FLOW_OBJECT),
      emergencies: t.array(COMPARE_FLOW_OBJECT),
      globalClusters: t.array(COMPARE_FLOW_OBJECT),
      governingEntities: t.array(COMPARE_FLOW_OBJECT),
    }),
  }),
  t.partial({
    categories: t.array(
      t.type({
        id: CATEGORY.props.id,
        name: CATEGORY.props.name,
        group: CATEGORY.props.group,
        state: STATE,
      })
    ),
    activeStatus,
    restricted,
    amountUSD,
    origAmount,
    exchangeRate,
    origCurrency,
    budgetYear,
    description,
    notes,
    flowDate,
    decisionDate,
    firstReportedDate,
  }),
]);

export const COMPARE_FLOWS_RESULT = t.type({
  flowA: COMPARE_FLOW,
  flowB: COMPARE_FLOW,
});

export type CompareFlowsResult = t.TypeOf<typeof COMPARE_FLOWS_RESULT>;

export interface Model {
  getFlow(params: GetFlowParams): Promise<GetFlowResult>;
  getFlowV4(params: GetFlowV4Params): Promise<GetFlowV4Result>;
  searchFlows(params: SearchFlowsParams): Promise<SearchFlowsResult>;
  bulkRejectPendingFlows(
    params: BulkRejectPendingFlowsParams
  ): Promise<BulkRejectPendingFlowsResults>;
  getFlowsDownloadXLSX(
    params: SearchFlowsParams
  ): Promise<SearchFlowsBatchesResult>;
  createFlow(params: CreateFlowParams): Promise<CreateFlowResult>;
  updateFlow(params: UpdateFlowParams): Promise<CreateFlowResult>;
  deleteFlow(params: DeleteFlowParams): Promise<DeleteFlowResult>;
  getAutocompleteFlows(
    params: GetFlowsAutocompleteParams
  ): Promise<GetFlowsAutocompleteResult>;
  compareFlows(params: CompareFlowsParams): Promise<CompareFlowsResult>;
}
