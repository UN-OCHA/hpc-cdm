import * as t from 'io-ts';

const ORGANIZATION_CATEGORY = t.type({
  id: t.number,
  name: t.string,
  description: t.union([t.string, t.null]),
  parentID: t.union([t.number, t.null]),
  code: t.union([t.string, t.null]),
  group: t.string,
  includeTotals: t.union([t.boolean, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  categoryRef: t.type({
    objectID: t.number,
    versionID: t.number,
    objectType: t.string,
    categoryID: t.number,
    createdAt: t.string,
    updatedAt: t.string,
  }),
});
export type OrganizationCategory = t.TypeOf<typeof ORGANIZATION_CATEGORY>;
export const ORGANIZATION = t.type({
  id: t.number,
  name: t.string,
  nativeName: t.union([t.string, t.null]),
  abbreviation: t.string,
  url: t.union([t.string, t.null]),
  parentID: t.union([t.number, t.null]),
  comments: t.union([t.string, t.null]),
  verified: t.boolean,
  notes: t.union([t.string, t.null]),
  active: t.boolean,
  collectiveInd: t.boolean,
  newOrganizationId: t.union([t.number, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  deletedAt: t.union([t.string, t.null]),
  categories: t.array(ORGANIZATION_CATEGORY),
});

export type Organization = t.TypeOf<typeof ORGANIZATION>;

export const GET_ORGANIZATIONS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});

export type GetOrganizationsAutocompleteParams = t.TypeOf<
  typeof GET_ORGANIZATIONS_AUTOCOMPLETE_PARAMS
>;

export const GET_ORGANIZATIONS_AUTOCOMPLETE_RESULT = t.array(ORGANIZATION);

export type GetOrganizationsAutocompleteResult = t.TypeOf<
  typeof GET_ORGANIZATIONS_AUTOCOMPLETE_RESULT
>;

export const GET_ORGANIZATION_PARAMS = t.type({
  id: t.number,
});

export type GetOrganizationParams = t.TypeOf<typeof GET_ORGANIZATION_PARAMS>;

export const GET_ORGANIZATION_RESULT = t.array(ORGANIZATION);

export type GetOrganizationResult = t.TypeOf<typeof GET_ORGANIZATION_RESULT>;

export interface Model {
  getAutocompleteOrganizations(
    params: GetOrganizationsAutocompleteParams
  ): Promise<GetOrganizationsAutocompleteResult>;
  getOrganization(
    params: GetOrganizationParams
  ): Promise<GetOrganizationResult>;
}
