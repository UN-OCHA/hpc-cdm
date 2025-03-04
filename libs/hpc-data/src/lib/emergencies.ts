import * as t from 'io-ts';
import { DATE_FROM_STRING, optional } from './util';

export const EMERGENCY = t.type({
  id: t.number,
  name: t.string,
  date: DATE_FROM_STRING,
  active: t.boolean,
  restricted: t.boolean,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  description: optional(t.string),
  glideId: optional(t.string),
  levelThree: optional(t.boolean),
});

export type Emergency = t.TypeOf<typeof EMERGENCY>;

export const GET_EMERGENCIES_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetEmergenciesAutocompleteParams = t.TypeOf<
  typeof GET_EMERGENCIES_AUTOCOMPLETE_PARAMS
>;

export const GET_EMERGENCIES_RESULT = t.array(EMERGENCY);
export type GetEmergenciesResult = t.TypeOf<typeof GET_EMERGENCIES_RESULT>;

const GET_EMERGENCIES_PARAMS = t.partial({
  years: t.array(t.number),
  locations: t.array(t.number),
});
export type GetEmergenciesParams = t.TypeOf<typeof GET_EMERGENCIES_PARAMS>;

export interface Model {
  getAutocompleteEmergencies(
    params: GetEmergenciesAutocompleteParams
  ): Promise<GetEmergenciesResult>;
  getEmergencies(params: GetEmergenciesParams): Promise<GetEmergenciesResult>;
}
