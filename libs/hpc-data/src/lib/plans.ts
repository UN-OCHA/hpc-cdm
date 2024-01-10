import * as t from 'io-ts';
import { CATEGORY } from './categories';
import { EMERGENCY } from './emergencies';
import { LOCATION } from './locations';
import { USAGE_YEAR } from './usageYears';
import { FLOW_OBJECT } from './flows';

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

export const PLAN_DETAIL = t.intersection([
  t.type({
    categories: t.array(CATEGORY),
    createdAt: t.string,
    emergencies: t.array(EMERGENCY),
    governingEntities: t.array(EMERGENCY),
    id: t.number,
    locations: t.array(LOCATION),
    planVersion: PLAN,
    restricted: t.boolean,
    revisionState: t.union([t.string, t.null]),
    updatedAt: t.string,
    years: t.array(USAGE_YEAR),
  }),
  t.partial({
    flowObject: FLOW_OBJECT,
  }),
]);

export type Plan = t.TypeOf<typeof PLAN>;

export const GET_PLANS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});

export const GET_PLAN_PARAMS = t.type({
  id: t.number,
});

export type GetPlansAutocompleteParams = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_PARAMS
>;

export const GET_PLANS_AUTOCOMPLETE_RESULT = t.array(PLAN);

export type GetPlansAutocompleteResult = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_RESULT
>;

export type GetPlanParams = t.TypeOf<typeof GET_PLAN_PARAMS>;

export type GetPlanResult = t.TypeOf<typeof PLAN_DETAIL>;

export interface Model {
  getAutocompletePlans(
    params: GetPlansAutocompleteParams
  ): Promise<GetPlansAutocompleteResult>;
  getPlan(params: GetPlanParams): Promise<GetPlanResult>;
}
