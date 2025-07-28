import * as t from 'io-ts';
import { CATEGORY } from './categories';
import { GLOBAL_CLUSTER } from './global-clusters';
import { LOCATION } from './locations';
import { ORGANIZATION } from './organizations';
import { PLAN_VERSION } from './plan-versions';
import { PROJECT_VERSION } from './project-versions';
import { DATE_FROM_STRING, optional } from './util';

const PROJECT_PDF_ENTRY = t.type({
  generatedAt: t.union([t.string, t.number]),
  file: t.type({
    fileHash: t.string,
  }),
});

export const PROJECT_PDF = t.partial({
  anonymous: PROJECT_PDF_ENTRY,
  withComments: PROJECT_PDF_ENTRY,
  commentsOnly: PROJECT_PDF_ENTRY,
});

const IMPLEMENTATION_STATUS = t.keyof({
  Planning: null,
  Implementing: null,
  'Ended - Completed': null,
  'Ended - Terminated': null,
  'Ended - Not started and abandoned': null,
});

export const PROJECT = t.type({
  id: t.number,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  code: optional(t.string),
  currentPublishedVersionId: optional(t.number),
  creatorParticipantId: optional(t.number),
  latestVersionId: optional(t.number),
  implementationStatus: optional(IMPLEMENTATION_STATUS),
  pdf: optional(PROJECT_PDF),
  sourceProjectId: optional(t.number),
});

export type ProjectAutocomplete = t.TypeOf<typeof PROJECT_AUTOCOMPLETE>;

export const GET_PROJECTS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});

export type GetProjectsAutocompleteParams = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_PARAMS
>;

export const PROJECT_AUTOCOMPLETE = t.type({
  ...PROJECT.props,
  name: t.string,
  version: t.number,
  projectVersionCode: t.string,
  visible: t.boolean,
});

const GET_PROJECT_PROJECT_VERSION_LOCATION = t.type({
  id: LOCATION.props.id,
  iso3: LOCATION.props.iso3,
  name: LOCATION.props.name,
  adminLevel: LOCATION.props.adminLevel,
  pcode: LOCATION.props.pcode,
  latitude: LOCATION.props.latitude,
  longitude: LOCATION.props.longitude,
  parentId: LOCATION.props.parentId,
});

const GET_PROJECT_PROJECT_VERSION = t.type({
  ...PROJECT_VERSION.props,
  categories: t.array(
    t.type({
      id: CATEGORY.props.id,
      name: CATEGORY.props.name,
      code: CATEGORY.props.code,
      group: CATEGORY.props.group,
    })
  ),
  organizations: t.array(ORGANIZATION),
  locations: t.array(GET_PROJECT_PROJECT_VERSION_LOCATION),
  globalClusters: t.array(GLOBAL_CLUSTER),
  plans: t.array(t.type({ id: t.number, planVersion: PLAN_VERSION })),
});

export const GET_PROJECTS_AUTOCOMPLETE_RESULT = t.array(PROJECT_AUTOCOMPLETE);

export type GetProjectsAutocompleteResult = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_RESULT
>;

export const GET_PROJECT_PARAMS = t.type({
  id: t.number,
});

export type GetProjectParams = t.TypeOf<typeof GET_PROJECT_PARAMS>;

export const GET_PROJECT_RESULT = t.type({
  ...PROJECT.props,
  projectVersion: GET_PROJECT_PROJECT_VERSION,
});

export type GetProjectResult = t.TypeOf<typeof GET_PROJECT_RESULT>;

export interface Model {
  getAutocompleteProjects(
    params: GetProjectsAutocompleteParams
  ): Promise<GetProjectsAutocompleteResult>;
  getProject(params: GetProjectParams): Promise<GetProjectResult>;
}
