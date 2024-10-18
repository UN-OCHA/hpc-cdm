import * as t from 'io-ts';
import { ORGANIZATION } from './organizations';
import { GLOBAL_CLUSTER } from './global-clusters';
import { PLAN_VERSION } from './plans';
import { CATEGORY } from './categories';
import { LOCATION_WITHOUT_CHILDREN } from './locations';

export const PDF = t.type({
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

const PROJECT_VERSION = t.type({
  id: t.number,
  projectId: t.number,
  endDate: t.string,
  startDate: t.string,
  categories: t.array(
    t.type({
      id: t.number,
      name: t.string,
      code: t.union([t.string, t.null]),
      group: t.union([t.string, t.null]),
    })
  ),
  organizations: t.array(ORGANIZATION),
  locations: t.array(t.type({ id: t.number, name: t.string })),
  globalClusters: t.array(GLOBAL_CLUSTER),
  plans: t.array(t.type({ id: t.number, planVersion: PLAN_VERSION })),
});

export type Project = t.TypeOf<typeof PROJECT>;

export const GET_PROJECTS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetProjectsAutocompleteParams = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_PARAMS
>;

export const GET_PROJECTS_AUTOCOMPLETE_RESULT = t.array(PROJECT);
export type GetProjectsAutocompleteResult = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_RESULT
>;

export const GET_PROJECT_PARAMS = t.type({
  id: t.number,
});

export type GetProjectParams = t.TypeOf<typeof GET_PROJECT_PARAMS>;

export const GET_PROJECT_RESULT = t.type({
  id: t.number,
  createdAt: t.string,
  updatedAt: t.string,
  code: t.union([t.string, t.null]),
  currentPublishedVersionId: t.union([t.number, t.null]),
  creatorParticipantId: t.union([t.number, t.null]),
  latestVersionId: t.union([t.number, t.null]),
  implementationStatus: t.union([t.string, t.null]),
  pdf: t.union([PDF, t.null]),
  projectVersion: PROJECT_VERSION,
  sourceProjectId: t.union([t.number, t.null]),
  visible: t.boolean,
});

export type GetProjectResult = t.TypeOf<typeof GET_PROJECT_RESULT>;

export interface Model {
  getAutocompleteProjects(
    params: GetProjectsAutocompleteParams
  ): Promise<GetProjectsAutocompleteResult>;
  getProject(params: GetProjectParams): Promise<GetProjectResult>;
}
