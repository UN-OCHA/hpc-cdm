import * as t from 'io-ts';
import { EMERGENCY } from './emergencies';
import { USAGE_YEAR } from './usageYears';
import { CATEGORY } from './categories';
import {
  GOVERNING_ENTITY,
  GOVERNING_ENTITY_VERSION,
} from './governing-entities';
import { LOCATION_WITHOUT_CHILDREN } from './locations';
import { recursiveIntersection } from './util';

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

export const PLAN_VERSION = t.type({
  id: t.number,
  planId: t.number,
  name: t.string,
  startDate: t.string,
  endDate: t.string,
  comments: t.union([t.string, t.null]),
  isForHPCProjects: t.boolean,
  code: t.union([t.string, t.null]),
  customLocationCode: t.union([t.string, t.null]),
  currentReportingPeriodId: t.union([t.number, t.null]),
  currentVersion: t.boolean,
  latestVersion: t.boolean,
  latestTaggedVersion: t.boolean,
  createdAt: t.string,
  updatedAt: t.string,
  lastPublishedReportingPeriodId: t.union([t.number, t.null]),
  clusterSelectionType: t.union([t.string, t.null]),
  visibilityPreferences: t.unknown,
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

const GET_PLAN_MAP = {
  planVersion: t.type({
    planVersion: PLAN_VERSION,
  }),
  locations: t.type({
    locations: t.array(LOCATION_WITHOUT_CHILDREN),
  }),
  governingEntities: t.type({
    governingEntities: t.array(
      t.intersection([
        GOVERNING_ENTITY,
        t.type({ governingEntityVersion: GOVERNING_ENTITY_VERSION }),
      ])
    ),
  }),
  categories: t.type({
    categories: t.array(
      t.intersection([CATEGORY, t.type({ categoryRef: t.unknown })])
    ),
  }),
  emergencies: t.type({
    emergencies: t.array(
      t.intersection([EMERGENCY, t.type({ planEmergency: t.unknown })])
    ),
  }),
  years: t.type({
    years: t.array(
      t.intersection([USAGE_YEAR, t.type({ planYear: t.unknown })])
    ),
  }),
};

const GET_PLAN_SCOPE = t.union([
  t.literal('categories'),
  t.literal('emergencies'),
  t.literal('governingEntities'),
  t.literal('locations'),
  t.literal('years'),
  t.literal('planVersion'),
]);

export type GetPlanScope = t.TypeOf<typeof GET_PLAN_SCOPE>;

// Helper type to extract the correct codec type
type V2GetPlanCodec<T extends GetPlanScope> = t.TypeOf<
  (typeof GET_PLAN_MAP)[T]
>;
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type GetPlanParams<T extends GetPlanScope[]> = {
  id: number;
  scopes: T;
};

const GET_PLAN_RESULT_PART = t.type({
  id: t.number,
  restricted: t.boolean,
});
export type GetPlanResult<T extends GetPlanScope[]> = t.TypeOf<
  typeof GET_PLAN_RESULT_PART
> &
  UnionToIntersection<V2GetPlanCodec<T[number]>>;

export const getPlanResultCodec = <T extends GetPlanScope[]>(
  scopes: T
): t.Type<GetPlanResult<T>> => {
  const codecs = scopes.map((scope) => GET_PLAN_MAP[scope]);

  return recursiveIntersection([GET_PLAN_RESULT_PART, ...codecs]);
};
export interface Model {
  getAutocompletePlans(
    params: GetPlansAutocompleteParams
  ): Promise<GetPlansAutocompleteResult>;
  getPlan<T extends GetPlanScope[]>(
    params: GetPlanParams<T>
  ): Promise<GetPlanResult<T>>;
}
