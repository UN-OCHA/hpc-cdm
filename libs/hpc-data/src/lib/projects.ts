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

const PROJECT = t.type({
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

export interface Model {
  getAutocompleteProjects(
    params: GetProjectsAutocompleteParams
  ): Promise<GetProjectsAutocompleteResult>;
}
