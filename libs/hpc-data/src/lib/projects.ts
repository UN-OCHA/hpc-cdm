import * as t from 'io-ts';

const PDF = t.type({
  withComments: t.union([
    t.type({
      file: t.type({
        fileHash: t.string,
      }),
      generatedAt: t.union([t.string, t.number]),
    }),
    t.undefined,
  ]),
  anonymous: t.union([
    t.type({
      file: t.type({
        fileHash: t.string,
      }),
      generatedAt: t.union([t.string, t.number]),
    }),
    t.undefined,
  ]),
});

export const PROJECT = t.type({
  id: t.number,
  createdAt: t.string,
  updatedAt: t.string,
  code: t.union([t.string, t.null]),
  currentPublishedVersionId: t.union([t.number, t.null]),
  creatorParticipantId: t.union([t.number, t.null]),
  latestVersionId: t.union([t.number, t.null]),
  implementationStatus: t.union([t.string, t.null]),
  pdf: t.union([PDF, t.null]),
  sourceProjectId: t.union([t.number, t.null]),
  name: t.string,
  version: t.number,
  projectVersionCode: t.string,
  visible: t.boolean,
});

const GlobalClusterType = t.type({
  id: t.number,
  hrinfoId: t.union([t.null, t.unknown]), // Use t.unknown for values that can be anything
  type: t.string,
  name: t.string,
  code: t.string,
  homepage: t.union([t.null, t.string]),
  defaultIconId: t.string,
  parentId: t.union([t.null, t.any]),
  displayFTSSummariesFromYear: t.number,
  createdAt: t.string,
  updatedAt: t.string,
  projectGlobalClusters: t.type({
    projectVersionId: t.number,
    globalClusterId: t.number,
    createdAt: t.string,
    updatedAt: t.string,
  }),
});

export const PlanVersionType = t.type({
  id: t.number,
  planId: t.number,
  name: t.string,
  startDate: t.string,
  endDate: t.string,
  comments: t.union([t.null, t.string]),
  isForHPCProjects: t.boolean,
  code: t.string,
  customLocationCode: t.union([t.null, t.string]),
  currentReportingPeriodId: t.union([t.null, t.any]),
  lastPublishedReportingPeriodId: t.union([t.null, t.any]),
  clusterSelectionType: t.union([t.null, t.any]),
  currentVersion: t.boolean,
  latestVersion: t.boolean,
  latestTaggedVersion: t.boolean,
  versionTags: t.array(t.string),
  createdAt: t.string,
  updatedAt: t.string,
});

const ProjectVersionPlanType = t.type({
  id: t.number,
  planId: t.number,
  projectVersionId: t.number,
  value: t.record(t.string, t.unknown), // Assuming 'value' is an object with unknown structure
  workflowStatusOptionId: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const OrganizationType = t.type({
  id: t.number,
  name: t.string,
  nativeName: t.string,
  abbreviation: t.string,
  url: t.string,
  parentID: t.union([t.null, t.any]),
  comments: t.string,
  verified: t.boolean,
  notes: t.string,
  active: t.boolean,
  collectiveInd: t.boolean,
  newOrganizationId: t.union([t.null, t.any]),
  createdAt: t.string,
  updatedAt: t.string,
  deletedAt: t.union([t.null, t.string]),
  projectVersionOrganization: t.type({
    projectVersionId: t.number,
    organizationId: t.number,
    createdAt: t.string,
    updatedAt: t.string,
  }),
});

const BudgetSegmentBreakdownEntityType = t.type({
  id: t.number,
  budgetSegmentBreakdownId: t.number,
  objectType: t.string,
  objectId: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const BudgetSegmentBreakdownType = t.type({
  id: t.number,
  budgetSegmentId: t.number,
  name: t.union([t.null, t.string]),
  content: t.type({
    amount: t.string,
    percent: t.number,
  }),
  type: t.union([t.null, t.string]),
  createdAt: t.string,
  updatedAt: t.string,
  entities: t.array(BudgetSegmentBreakdownEntityType),
});

const BudgetSegmentType = t.type({
  id: t.number,
  projectVersionId: t.number,
  name: t.string,
  createdAt: t.string,
  updatedAt: t.string,
  breakdown: t.array(BudgetSegmentBreakdownType),
});

const LocationType = t.type({
  id: t.number,
  iso3: t.string,
  name: t.string,
  adminLevel: t.number,
  pcode: t.string,
  latitude: t.number,
  longitude: t.number,
  parentId: t.union([t.null, t.any]),
});

const ProjectVersionType = t.type({
  id: t.number,
  code: t.string,
  currentRequestedFunds: t.string,
  editorParticipantId: t.union([t.null, t.any]),
  endDate: t.string,
  implementationStatus: t.string,
  name: t.string,
  objective: t.string,
  partners: t.string,
  projectId: t.number,
  startDate: t.string,
  tags: t.array(t.string),
  version: t.number,
  createdAt: t.string,
  updatedAt: t.string,
  globalClusters: t.array(GlobalClusterType),
  plans: t.array(
    t.type({
      id: t.number,
      restricted: t.boolean,
      revisionState: t.union([t.null, t.any]),
      createdAt: t.string,
      updatedAt: t.string,
      planVersion: PlanVersionType,
      projectVersionPlan: ProjectVersionPlanType,
      procedureEntityPrototypes: t.array(t.unknown),
      conditionFields: t.array(t.unknown),
      workflowStatusOptions: t.array(t.unknown),
      procedureSections: t.array(t.unknown),
    })
  ),
  governingEntities: t.array(
    t.type({
      overriding: t.boolean,
    })
  ),
  planEntities: t.array(t.unknown),
  organizations: t.array(OrganizationType),
  categories: t.array(t.unknown),
  projectVersionPlans: t.array(ProjectVersionPlanType),
  attachments: t.array(t.unknown),
  budgetSegments: t.array(BudgetSegmentType),
  contacts: t.array(t.unknown),
  history: t.array(t.unknown),
  locations: t.array(LocationType),
  log: t.array(t.unknown),
});

export const PROJECT_DETAIL = t.type({
  id: t.number,
  createdAt: t.string,
  updatedAt: t.string,
  code: t.union([t.string, t.null]),
  currentPublishedVersionId: t.union([t.number, t.null]),
  creatorParticipantId: t.union([t.number, t.null]),
  latestVersionId: t.union([t.number, t.null]),
  implementationStatus: t.union([t.string, t.null]),
  pdf: t.union([PDF, t.null]),
  sourceProjectId: t.union([t.number, t.null]),
  name: t.string,
  version: t.number,
  projectVersionCode: t.string,
  visible: t.boolean,
  projectVersions: t.array(ProjectVersionType),
  governingEntities: t.array(t.string),
});

export type Project = t.TypeOf<typeof PROJECT>;

export const GET_PROJECTS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetProjectsAutocompleteParams = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_PARAMS
>;
export type GetProjectsAutocompleteGraphQLParams = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_PARAMS
>;

export const GET_PROJECTS_AUTOCOMPLETE_RESULT = t.array(PROJECT);
export type GetProjectsAutocompleteResult = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_RESULT
>;
export type GetProjectsAutocompleteGraphQLResult = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_GRAPHQL_RESULT
>;

export const GET_PROJECTS_AUTOCOMPLETE_GRAPHQL_RESULT = t.type({
  getProjects: t.array(PROJECT),
});

export const GET_PROJECT_PARAMS = t.type({
  id: t.number,
});

export type GetProjectParams = t.TypeOf<typeof GET_PROJECT_PARAMS>;

export type GetProjectResult = t.TypeOf<typeof PROJECT_DETAIL>;

export interface Model {
  getAutocompleteProjects(
    params: GetProjectsAutocompleteParams
  ): Promise<GetProjectsAutocompleteResult>;
  getAutocompleteProjectsGraphQL(
    params: GetProjectsAutocompleteGraphQLParams
  ): Promise<GetProjectsAutocompleteGraphQLResult>;
  getProject(params: GetProjectParams): Promise<GetProjectResult>;
}
