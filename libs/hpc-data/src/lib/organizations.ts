import * as t from 'io-ts';
import { CATEGORY } from './categories';
import { LOCATION } from './locations';

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
const ORGANIZATION = t.type({
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

const UPDATED_CREATED_BY = t.type({
  participantName: t.string,
  date: t.string,
  endpointId: t.number,
});
export type UpdatedCreatedBy = t.TypeOf<typeof UPDATED_CREATED_BY>;
const SEARCH_ORGANIZATION = t.type({
  id: t.number,
  name: t.string,
  nativeName: t.union([t.string, t.null]),
  abbreviation: t.string,
  active: t.boolean,
  categories: t.array(
    t.type({
      name: t.string,
      group: t.string,
      parentID: t.union([t.number, t.null]),
    })
  ),
  locations: t.array(
    t.type({
      id: t.number,
      name: t.string,
      parentID: t.union([t.number, t.null]),
    })
  ),
  create: t.array(UPDATED_CREATED_BY),
  update: t.array(UPDATED_CREATED_BY),
});
export type SearchOrganiation = t.TypeOf<typeof SEARCH_ORGANIZATION>;

export const SEARCH_ORGANIZATIONS = t.array(SEARCH_ORGANIZATION);
export type SearchOrganiations = t.TypeOf<typeof SEARCH_ORGANIZATIONS>;

export const GET_ORGANIZATIONS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});

export type GetOrganizationsAutocompleteParams = t.TypeOf<
  typeof GET_ORGANIZATIONS_AUTOCOMPLETE_PARAMS
>;

export const GET_ORGANIZATIONS_RESULT = t.array(ORGANIZATION);

export type GetOrganizationsResult = t.TypeOf<typeof GET_ORGANIZATIONS_RESULT>;

export const SEARCH_ORGANIZATION_PARAMS = t.type({
  search: t.partial({
    status: t.string,
    date: t.string,
    locations: t.array(LOCATION),
    verified: t.string,
    parentOrganization: ORGANIZATION,
    organizationType: CATEGORY,
    organization: t.type({
      name: t.string,
    }),
    orderBy: t.string,
    orderDir: t.union([t.string, t.null]),
    limit: t.number,
    offset: t.number,
  }),
});
export type SearchOrganizationParams = t.TypeOf<
  typeof SEARCH_ORGANIZATION_PARAMS
>;

export const SEARCH_ORGANIZATION_RESULT = t.type({
  count: t.string,
  organizations: SEARCH_ORGANIZATIONS,
});

export type SearchOrnganizationResult = t.TypeOf<
  typeof SEARCH_ORGANIZATION_RESULT
>;
export interface Model {
  getAutocompleteOrganizations(
    params: GetOrganizationsAutocompleteParams
  ): Promise<GetOrganizationsResult>;
  searchOrganizations(
    params: SearchOrganizationParams
  ): Promise<SearchOrnganizationResult>;
}
