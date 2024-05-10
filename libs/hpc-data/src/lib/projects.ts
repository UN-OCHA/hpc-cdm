import * as t from 'io-ts';
import { FLOW_OBJECT } from './flowObject';

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
  restricted: t.boolean,
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

export const PROJECT_DETAIL = t.intersection([
  t.type({
    id: t.number,
    restricted: t.boolean,
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
    projectVersions: t.array(PROJECT),
  }),
  t.partial({
    flowObject: FLOW_OBJECT,
  }),
]);

export const GET_PROJECT_PARAMS = t.type({
  id: t.number,
});

export type GetProjectParams = t.TypeOf<typeof GET_PROJECT_PARAMS>;

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

export type GetProjectResult = t.TypeOf<typeof PROJECT_DETAIL>;

export interface Model {
  getAutocompleteProjects(
    params: GetProjectsAutocompleteParams
  ): Promise<GetProjectsAutocompleteResult>;
  getProject(params: GetProjectParams): Promise<GetProjectResult>;
}
