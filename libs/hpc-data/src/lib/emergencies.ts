import * as t from 'io-ts';
import { CATEGORY } from './categories';
import { LOCATION } from './locations';
import { FLOW_OBJECT } from './flows';

export const EMERGENCY = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    description: t.union([t.string, t.null]),
    date: t.string,
    glideId: t.union([t.string, t.null]),
    levelThree: t.union([t.boolean, t.null]),
    active: t.boolean,
    restricted: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    flowObject: FLOW_OBJECT,
  }),
]);

export const EMERGENCY_DETAIL = t.type({
  id: t.number,
  name: t.string,
  description: t.union([t.string, t.null]),
  date: t.string,
  glideId: t.union([t.string, t.null]),
  levelThree: t.union([t.boolean, t.null]),
  active: t.boolean,
  restricted: t.boolean,
  createdAt: t.string,
  updatedAt: t.string,
  categories: t.array(CATEGORY),
  locations: t.array(LOCATION),
});

export type Emergency = t.TypeOf<typeof EMERGENCY>;

export const GET_EMERGENCIES_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetEmergenciesAutocompleteParams = t.TypeOf<
  typeof GET_EMERGENCIES_AUTOCOMPLETE_PARAMS
>;

export const GET_EMERGENCIES_AUTOCOMPLETE_RESULT = t.array(EMERGENCY);
export type GetEmergenciesAutocompleteResult = t.TypeOf<
  typeof GET_EMERGENCIES_AUTOCOMPLETE_RESULT
>;

export const GET_EMERGENCY_PARAMS = t.type({
  id: t.number,
});

export type GetEmergencyParams = t.TypeOf<typeof GET_EMERGENCY_PARAMS>;

export type GetEmergencyResult = t.TypeOf<typeof EMERGENCY_DETAIL>;

export interface Model {
  getAutocompleteEmergencies(
    params: GetEmergenciesAutocompleteParams
  ): Promise<GetEmergenciesAutocompleteResult>;
  getEmergency(params: GetEmergencyParams): Promise<GetEmergencyResult>;
}
