import * as t from 'io-ts';
import { DATE_FROM_STRING, INTEGER_FROM_STRING, optional } from './util';

export const LOCATION = t.type({
  id: t.number,
  name: t.string,
  itosSync: t.boolean,
  status: t.string,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  externalId: optional(t.string),
  adminLevel: optional(t.number),
  latitude: optional(t.number),
  longitude: optional(t.number),
  parentId: optional(t.number),
  iso3: optional(t.string),
  pcode: optional(t.string),
  validOn: optional(INTEGER_FROM_STRING),
});

export type Location = t.TypeOf<typeof LOCATION>;

export type LocationWithChildren = Location & {
  children?: LocationWithChildren[];
};
export const LOCATION_WITH_CHILDREN: t.Type<LocationWithChildren> = t.recursion(
  'LOCATION',
  (self) =>
    t.intersection([
      LOCATION,
      t.partial({
        children: t.array(self),
      }),
    ])
);

export const GET_LOCATIONS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});

export type GetLocationsAutocompleteParams = t.TypeOf<
  typeof GET_LOCATIONS_AUTOCOMPLETE_PARAMS
>;

export const GET_LOCATIONS_AUTOCOMPLETE_RESULT = t.array(
  LOCATION_WITH_CHILDREN
);

export type GetLocationsAutocompleteResult = t.TypeOf<
  typeof GET_LOCATIONS_AUTOCOMPLETE_RESULT
>;

export interface Model {
  getAutocompleteLocations(
    params: GetLocationsAutocompleteParams
  ): Promise<GetLocationsAutocompleteResult>;
}
