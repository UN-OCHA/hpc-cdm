import * as t from 'io-ts';

const LOCATION_BASE = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    adminLevel: t.number,
    status: t.string,
    itosSync: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    externalId: t.union([t.string, t.null]),
    latitude: t.union([t.number, t.null]),
    longitude: t.union([t.number, t.null]),
    pcode: t.union([t.string, t.null]),
    iso3: t.union([t.string, t.null]),
    validOn: t.union([t.string, t.null]),
  }),
]);

const LOCATION_CHILD = t.intersection([
  LOCATION_BASE,
  t.type({
    parentId: t.number,
  }),
]);

const LOCATION = t.intersection([
  LOCATION_BASE,
  t.partial({
    parentId: t.union([t.number, t.null]),
    children: t.union([t.array(LOCATION_CHILD), t.null]),
  }),
]);

const GET_LOCATIONS_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type Location = t.TypeOf<typeof LOCATION>;

export const GET_LOCATIONS_RESULT = t.array(LOCATION);

export type GetLocationsAutocompleteParams = t.TypeOf<
  typeof GET_LOCATIONS_AUTOCOMPLETE_PARAMS
>;

export type GetLocationsResult = t.TypeOf<typeof GET_LOCATIONS_RESULT>;

export interface Model {
  getLocationsAutocomplete(
    params: GetLocationsAutocompleteParams
  ): Promise<GetLocationsResult>;
}
