import * as t from 'io-ts';

const PROJECT = t.intersection([
  t.type({
    id: t.number,
    createdAt: t.string,
    updatedAt: t.string,
    latestVersionId: t.number,
    name: t.string,
    version: t.number,
    projectVersionCode: t.string,
    visible: t.boolean,
  }),
  t.partial({
    code: t.union([t.string, t.null]),
    creatorParticipantId: t.union([t.number, t.null]),
    currentPublishedVersionId: t.union([t.number, t.null]),
    implementationStatus: t.union([t.string, t.null]),
    pdf: t.union([
      t.partial({
        anonymous: t.partial({
          file: t.unknown,
          generatedAt: t.union([t.string, t.number]),
        }),
      }),
      t.null,
    ]),
    sourceProjectId: t.union([t.number, t.null]),
  }),
]);

const GET_PROJECTS_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type Project = t.TypeOf<typeof PROJECT>;

export const GET_PROJECTS_RESULT = t.array(PROJECT);

export type GetProjectsAutocompleteParams = t.TypeOf<
  typeof GET_PROJECTS_AUTOCOMPLETE_PARAMS
>;

export type GetProjectsResult = t.TypeOf<typeof GET_PROJECTS_RESULT>;

export interface Model {
  getProjectsAutocomplete(
    params: GetProjectsAutocompleteParams
  ): Promise<GetProjectsResult>;
}
