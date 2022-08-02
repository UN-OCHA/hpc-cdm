import * as t from 'io-ts';
import { PROJECT_VERSION } from './projectVersions';

export const PROJECT = t.intersection([
  t.type({
    id: t.number,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    name: t.union([t.string, t.null]),
    version: t.union([t.number, t.null]),
    projectVersionCode: t.union([t.string, t.null]),
    visible: t.union([t.boolean, t.null]),
    code: t.union([t.string, t.null]),
    latestVersionId: t.union([t.number, t.null]),
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
    projectVersions: t.array(PROJECT_VERSION),
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
