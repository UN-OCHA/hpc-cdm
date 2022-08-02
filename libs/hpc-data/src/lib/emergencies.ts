import * as t from 'io-ts';

export const EMERGENCY = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    date: t.string,
    active: t.boolean,
    restricted: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    description: t.union([t.string, t.null]),
    glideId: t.union([t.string, t.null]),
    levelThree: t.union([t.boolean, t.null]),
  }),
]);

const GET_EMERGENCIES_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type Emergency = t.TypeOf<typeof EMERGENCY>;

export const GET_EMERGENCIES_RESULT = t.array(EMERGENCY);

export type GetEmergenciesAutocompleteParams = t.TypeOf<
  typeof GET_EMERGENCIES_AUTOCOMPLETE_PARAMS
>;

export type GetEmergenciesResult = t.TypeOf<typeof GET_EMERGENCIES_RESULT>;

export interface Model {
  getEmergenciesAutocomplete(
    params: GetEmergenciesAutocompleteParams
  ): Promise<GetEmergenciesResult>;
}
