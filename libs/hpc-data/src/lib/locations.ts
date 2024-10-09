import * as t from 'io-ts';

export type Location = {
  id: number;
  externalId: string | null;
  name: string;
  adminLevel: number | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  iso3: string | null;
  pcode: string | null;
  status: string;
  validOn: string | null;
  itosSync: boolean;
  children?: Location[];
};

export const LOCATION_WITHOUT_CHILDREN = t.type({
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
});

export const LOCATION: t.Type<Location> = t.recursion('LOCATION', () =>
  t.intersection([
    LOCATION_WITHOUT_CHILDREN,
    t.partial({
      children: t.array(LOCATION), // Recursively define children
    }),
  ])
);

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
