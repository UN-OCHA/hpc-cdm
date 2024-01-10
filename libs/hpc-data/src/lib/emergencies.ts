import * as t from 'io-ts';

const EMERGENCY = t.type({
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

export interface Model {
  getAutocompleteEmergencies(
    params: GetEmergenciesAutocompleteParams
  ): Promise<GetEmergenciesAutocompleteResult>;
}
