import * as t from 'io-ts';

const CATEGORY_REF = t.type({
  objectID: t.number,
  versionID: t.number,
  objectType: t.string,
  categoryID: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const CATEGORY = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    group: t.string,
    createdAt: t.string,
    updatedAt: t.string,
    categoryRef: CATEGORY_REF,
  }),
  t.partial({
    description: t.union([t.string, t.null]),
    parentID: t.union([t.number, t.null]),
    code: t.union([t.string, t.null]),
    includeTotals: t.union([t.boolean, t.null]),
  }),
]);

const ORGANIZATION = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    abbreviation: t.string,
    verified: t.boolean,
    active: t.boolean,
    collectiveInd: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    newOrganizationId: t.union([t.number, t.null]),
    nativeName: t.union([t.string, t.null]),
    url: t.union([t.string, t.null]),
    parentID: t.union([t.number, t.null]),
    comments: t.union([t.string, t.null]),
    notes: t.union([t.string, t.null]),
    deletedAt: t.union([t.string, t.null]),
    categories: t.union([t.array(CATEGORY), t.null]),
  }),
]);

const GET_ORGANIZATIONS_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type Organization = t.TypeOf<typeof ORGANIZATION>;

export const GET_ORGANIZATIONS_RESULT = t.array(ORGANIZATION);

export type GetOrganizationsAutocompleteParams = t.TypeOf<
  typeof GET_ORGANIZATIONS_AUTOCOMPLETE_PARAMS
>;

export type GetOrganizationsResult = t.TypeOf<typeof GET_ORGANIZATIONS_RESULT>;

export interface Model {
  getOrganizationsAutocomplete(
    params: GetOrganizationsAutocompleteParams
  ): Promise<GetOrganizationsResult>;
}
