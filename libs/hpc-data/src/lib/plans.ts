import * as t from 'io-ts';

export const PLAN = t.intersection([
  t.type({
    id: t.number,
    restricted: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    planVersionId: t.number,
    planId: t.number,
    name: t.string,
    startDate: t.string,
    endDate: t.string,
    isForHPCProjects: t.boolean,
    code: t.string,
    currentVersion: t.boolean,
    latestVersion: t.boolean,
    latestTaggedVersion: t.boolean,
    revisionState: t.union([t.string, t.null]),
    comments: t.union([t.string, t.null]),
    customLocationCode: t.union([t.string, t.null]),
    currentReportingPeriodId: t.union([t.number, t.null]),
    lastPublishedReportingPeriodId: t.union([t.number, t.null]),
    clusterSelectionType: t.union([t.string, t.null]),
    versionTags: t.union([t.array(t.string), t.null]),
  }),
]);

const GET_PLANS_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type Plan = t.TypeOf<typeof PLAN>;

export const GET_PLANS_RESULT = t.array(PLAN);

export type GetPlansAutocompleteParams = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_PARAMS
>;

export type GetPlansResult = t.TypeOf<typeof GET_PLANS_RESULT>;

export interface Model {
  getPlansAutocomplete(
    params: GetPlansAutocompleteParams
  ): Promise<GetPlansResult>;
}
