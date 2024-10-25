import * as t from 'io-ts';

export const LOCATION_BUILDER = {
  id: t.number,
  externalId: t.union([t.string, t.null]),
  name: t.string,
  adminLevel: t.union([t.number, t.null]),
  latitude: t.union([t.number, t.null]),
  longitude: t.union([t.number, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  parentId: t.union([t.number, t.null]),
  iso3: t.union([t.string, t.null]),
  pcode: t.union([t.string, t.null]),
  status: t.string,
  validOn: t.union([t.string, t.null]),
  itosSync: t.boolean,
};

export const LOCATION = t.type({
  ...LOCATION_BUILDER,
  children: t.array(t.type(LOCATION_BUILDER)),
});

export type Location = t.TypeOf<typeof LOCATION>;

export const GET_LOCATIONS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});

export type GetLocationsAutocompleteParams = t.TypeOf<
  typeof GET_LOCATIONS_AUTOCOMPLETE_PARAMS
>;

export const GET_LOCATIONS_AUTOCOMPLETE_RESULT = t.array(LOCATION);

export type GetLocationsAutocompleteResult = t.TypeOf<
  typeof GET_LOCATIONS_AUTOCOMPLETE_RESULT
>;

export interface Model {
  getAutocompleteLocations(
    params: GetLocationsAutocompleteParams
  ): Promise<GetLocationsAutocompleteResult>;
}
