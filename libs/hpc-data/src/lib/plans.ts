import * as t from 'io-ts';

export const PLAN = t.type({
  id: t.number,
  restricted: t.boolean,
  revisionState: t.union([t.string, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  planVersionId: t.number,
  planId: t.number,
  name: t.string,
  startDate: t.string,
  endDate: t.string,
  comments: t.union([t.null, t.string]),
  isForHPCProjects: t.boolean,
  code: t.union([t.string, t.null]),
  customLocationCode: t.union([t.null, t.string]),
  currentReportingPeriodId: t.union([t.null, t.number]),
  lastPublishedReportingPeriodId: t.union([t.null, t.number]),
  clusterSelectionType: t.union([t.null, t.string]),
  currentVersion: t.boolean,
  latestVersion: t.boolean,
  latestTaggedVersion: t.boolean,
  versionTags: t.union([t.array(t.string), t.null]),
});
export type Plan = t.TypeOf<typeof PLAN>;

export const GET_PLANS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetPlansAutocompleteParams = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_PARAMS
>;

export const GET_PLANS_AUTOCOMPLETE_RESULT = t.array(PLAN);
export type GetPlansAutocompleteResult = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_RESULT
>;

export interface Model {
  getAutocompletePlans(
    params: GetPlansAutocompleteParams
  ): Promise<GetPlansAutocompleteResult>;
  getPlan(params: { id: number }): Promise<Plan>;
}
