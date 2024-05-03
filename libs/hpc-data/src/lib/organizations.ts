import * as t from 'io-ts';
import { LOCATION_BUILDER } from './locations';
import { FLOW_OBJECT } from './flowObject';

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
const ORGANIZATION_BUILDER = t.intersection([
  t.type({
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
  }),
  t.partial({
    categories: t.array(ORGANIZATION_CATEGORY),
    locations: t.array(t.type(LOCATION_BUILDER)),
    flowObject: FLOW_OBJECT,
  }),
]);

export const ORGANIZATION = t.intersection([
  ORGANIZATION_BUILDER,
  t.partial({
    parent: t.union([
      t.intersection([
        ORGANIZATION_BUILDER,
        t.partial({ parent: t.union([ORGANIZATION_BUILDER, t.null]) }),
      ]),
      t.null,
    ]),
  }),
]);
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

export const GET_ORGANIZATIONS_BY_ID_PARAMS = t.number;

export type GetOrganizationsByIdParams = t.TypeOf<
  typeof GET_ORGANIZATIONS_BY_ID_PARAMS
>;

export const GET_ORGANIZATIONS_RESULT = t.array(ORGANIZATION);

export type GetOrganizationsResult = t.TypeOf<typeof GET_ORGANIZATIONS_RESULT>;

export const SEARCH_ORGANIZATION_PARAMS = t.type({
  search: t.partial({
    status: t.string,
    date: t.string,
    locations: t.array(
      t.union([
        t.type({ name: t.string, id: t.number }),
        t.partial({ parentId: t.number }),
      ])
    ),
    verified: t.string,
    parentOrganization: t.type({ name: t.string, id: t.number }),
    organizationType: t.type({ name: t.string, id: t.number }),
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

export const GET_ORGANIZATION_PARAMS = t.type({
  id: t.number,
});

export type GetOrganizationResult = t.TypeOf<typeof ORGANIZATION>;

export type GetOrganizationParams = t.TypeOf<typeof GET_ORGANIZATION_PARAMS>;

export const CREATE_ORGANIZATION_PARAMS = t.type({
  organization: t.intersection([
    t.type({
      name: t.string,
      abbreviation: t.string,
      categories: t.array(t.number),
    }),
    t.partial({
      nativeName: t.string,
      locations: t.array(t.number),
      url: t.string,
      notes: t.string,
      comments: t.string,
      verfied: t.boolean,
      parentID: t.number,
    }),
  ]),
});
export const CREATE_ORGANIZATION_RESULT = t.intersection([
  ORGANIZATION,
  t.type({ meta: t.type({ language: t.string }) }),
]);

export type CreateOrganizationParams = t.TypeOf<
  typeof CREATE_ORGANIZATION_PARAMS
>;
export type CreateOrganizationResult = t.TypeOf<
  typeof CREATE_ORGANIZATION_RESULT
>;

export const UPDATE_ORGANIZATION_PARAMS = t.intersection([
  t.type({
    id: t.number,
  }),
  t.partial({
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
    categories: t.array(t.number),
    locations: t.array(t.number),
  }),
]);
export type UpdateOrganizationParams = t.TypeOf<
  typeof UPDATE_ORGANIZATION_PARAMS
>;

export const UPDATE_ORGANIZATION_RESULT = t.intersection([
  ORGANIZATION,
  t.type({
    participantLog: t.array(
      t.type({
        editType: t.string,
        createdAt: t.string,
        participant: t.union([t.type({ name: t.string }), t.null]),
      })
    ),
  }),
]);

export type UpdateOrganizationResult = t.TypeOf<
  typeof UPDATE_ORGANIZATION_RESULT
>;

const DELETE_ORGANIZATION_PARAMS = t.type({
  id: t.number,
});
export type DeleteOrganizationParams = t.TypeOf<
  typeof DELETE_ORGANIZATION_PARAMS
>;

export const DELETE_ORGANIZATION_RESULT = t.undefined;

export type DeleteOrganizationResult = t.TypeOf<
  typeof DELETE_ORGANIZATION_RESULT
>;

const MERGE_ORGANIZATIONS_PARAMS = t.type({
  fromOrganizationIds: t.type({
    organizationId: t.number,
    organizationsToBeMerged: t.array(UPDATE_ORGANIZATION_PARAMS),
  }),
});
export type MergeOrganizationsParams = t.TypeOf<
  typeof MERGE_ORGANIZATIONS_PARAMS
>;

export type MergeOrganizationsResult = Organization;
export interface Model {
  getAutocompleteOrganizations(
    params: GetOrganizationsAutocompleteParams
  ): Promise<GetOrganizationsResult>;
  searchOrganizations(
    params: SearchOrganizationParams
  ): Promise<SearchOrnganizationResult>;
  getOrganization(
    params: GetOrganizationParams
  ): Promise<GetOrganizationResult>;
  getOrganizationsById(
    params: GetOrganizationsByIdParams
  ): Promise<GetOrganizationsResult>;
  createOrganization(
    params: CreateOrganizationParams
  ): Promise<CreateOrganizationResult>;
  updateOrganization(
    params: UpdateOrganizationParams
  ): Promise<UpdateOrganizationResult>;
  deleteOrganization(
    params: DeleteOrganizationParams
  ): Promise<DeleteOrganizationResult>;
  mergeOrganizations(
    params: MergeOrganizationsParams
  ): Promise<MergeOrganizationsResult>;
}
