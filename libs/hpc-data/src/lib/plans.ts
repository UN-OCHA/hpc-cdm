import * as t from 'io-ts';
import { CATEGORY } from './categories';
import { EMERGENCY } from './emergencies';
import {
  GOVERNING_ENTITY,
  GOVERNING_ENTITY_VERSION,
} from './governing-entities';
import { LOCATION } from './locations';
import { PLAN_VERSION } from './plan-versions';
import { USAGE_YEAR } from './usageYears';
import { DATE_FROM_STRING, optional, recursiveIntersection } from './util';

const PLAN_REVISION_STATE = t.keyof({
  none: null,
  planDataAndProjects: null,
  planDataOnly: null,
  projectsOnly: null,
});

export const PLAN = t.type({
  id: t.number,
  isReleased: t.boolean,
  restricted: t.boolean,
  revisionState: optional(PLAN_REVISION_STATE),
  releasedDate: optional(DATE_FROM_STRING),
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
});

export const PLAN_AUTOCOMPLETE = t.type({
  ...PLAN.props,
  ...PLAN_VERSION.props,
  planVersionId: t.number,
});

export const GET_PLANS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetPlansAutocompleteParams = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_PARAMS
>;

export const GET_PLANS_AUTOCOMPLETE_RESULT = t.array(PLAN_AUTOCOMPLETE);
export type GetPlansAutocompleteResult = t.TypeOf<
  typeof GET_PLANS_AUTOCOMPLETE_RESULT
>;

const GET_PLAN_MAP = {
  planVersion: t.type({
    planVersion: PLAN_VERSION,
  }),
  locations: t.type({
    locations: t.array(LOCATION),
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

const GET_PLAN_SCOPE = t.keyof({
  categories: null,
  emergencies: null,
  governingEntities: null,
  locations: null,
  years: null,
  planVersion: null,
});

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

const GET_AUTOCOMPLETE_PLANS_BY_ID_PARAMS = t.type({
  id: t.number,
});
export type GetAutocompletePlansByIdParams = t.TypeOf<
  typeof GET_AUTOCOMPLETE_PLANS_BY_ID_PARAMS
>;

export const GET_AUTOCOMPLETE_PLANS_BY_ID_RESULT = t.array(
  t.type({
    id: t.number,
    restricted: t.boolean,
    revisionState: optional(t.string),
  })
);

export type GetAutocompletePlansByIdResult = t.TypeOf<
  typeof GET_AUTOCOMPLETE_PLANS_BY_ID_RESULT
>;

export interface Model {
  getAutocompletePlans(
    params: GetPlansAutocompleteParams
  ): Promise<GetPlansAutocompleteResult>;
  getAutocompletePlansById(
    params: GetAutocompletePlansByIdParams
  ): Promise<GetAutocompletePlansByIdResult>;
  getPlan<T extends GetPlanScope[]>(
    params: GetPlanParams<T>
  ): Promise<GetPlanResult<T>>;
}
