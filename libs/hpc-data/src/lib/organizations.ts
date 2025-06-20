import * as t from 'io-ts';
import { CATEGORY_GROUP_TYPE, CATEGORY_WITH_CATEGORY_REF } from './categories';
import { LOCATION_WITH_CHILDREN } from './locations';
import {
  ABORT_SIGNAL,
  DATE_FROM_STRING,
  INTEGER_FROM_STRING,
  optional,
} from './util';

export const ORGANIZATION_MODEL = t.type({
  id: t.number,
  name: t.string,
  abbreviation: t.string,
  active: t.boolean,
  verified: t.boolean,
  collectiveInd: t.boolean,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  nativeName: optional(t.string),
  url: optional(t.string),
  parentID: optional(t.number),
  comments: optional(t.string),
  notes: optional(t.string),
  newOrganizationId: optional(t.number),
  deletedAt: optional(DATE_FROM_STRING),
});

export type OrganizationCategory = t.TypeOf<typeof CATEGORY_WITH_CATEGORY_REF>;

export type Organization = t.TypeOf<typeof ORGANIZATION_MODEL> &
  Partial<{
    categories: Array<t.TypeOf<typeof CATEGORY_WITH_CATEGORY_REF>>;
    locations: Array<t.TypeOf<typeof LOCATION_WITH_CHILDREN>>;
    parent: Organization | null;
  }>;
export const ORGANIZATION: t.Type<Organization> = t.recursion(
  'ORGANIZATION',
  (self) =>
    t.intersection([
      ORGANIZATION_MODEL,
      t.partial({
        categories: t.array(CATEGORY_WITH_CATEGORY_REF),
        locations: t.array(LOCATION_WITH_CHILDREN),
        parent: optional(self),
      }),
    ])
);

const UPDATED_CREATED_BY = t.type({
  participantName: t.string,
  date: DATE_FROM_STRING,
  endpointId: t.number,
});

export type UpdatedCreatedBy = t.TypeOf<typeof UPDATED_CREATED_BY>;

const SEARCH_ORGANIZATION = t.type({
  id: ORGANIZATION_MODEL.props.id,
  name: ORGANIZATION_MODEL.props.name,
  nativeName: ORGANIZATION_MODEL.props.nativeName,
  abbreviation: ORGANIZATION_MODEL.props.abbreviation,
  active: ORGANIZATION_MODEL.props.active,
  categories: t.array(
    t.type({
      name: t.string,
      group: CATEGORY_GROUP_TYPE,
      parentID: optional(t.number),
    })
  ),
  locations: t.array(
    t.type({
      id: t.number,
      name: t.string,
      parentID: optional(t.number),
    })
  ),
  create: t.array(UPDATED_CREATED_BY),
  update: t.array(UPDATED_CREATED_BY),
});

export type SearchOrganization = t.TypeOf<typeof SEARCH_ORGANIZATION>;

export const SEARCH_ORGANIZATIONS = t.array(SEARCH_ORGANIZATION);

export type SearchOrganizations = t.TypeOf<typeof SEARCH_ORGANIZATIONS>;

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
    signal: ABORT_SIGNAL,
  }),
});

export type SearchOrganizationParams = t.TypeOf<
  typeof SEARCH_ORGANIZATION_PARAMS
>;

export const SEARCH_ORGANIZATION_RESULT = t.type({
  count: t.string,
  organizations: SEARCH_ORGANIZATIONS,
});

export type SearchOrganizationResult = t.TypeOf<
  typeof SEARCH_ORGANIZATION_RESULT
>;

export const GET_ORGANIZATION_PARAMS = t.type({
  id: t.number,
});

export const GET_ORGANIZATION_RESULT = t.intersection([
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

export type GetOrganizationResult = t.TypeOf<typeof GET_ORGANIZATION_RESULT>;

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
      verified: t.boolean,
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
    abbreviation: t.string,
    verified: t.boolean,
    active: t.boolean,
    collectiveInd: t.boolean,
    createdAt: DATE_FROM_STRING,
    updatedAt: DATE_FROM_STRING,
    categories: t.array(t.number),
    locations: t.array(t.number),
    nativeName: optional(t.string),
    url: optional(t.string),
    parentID: optional(t.number),
    comments: optional(t.string),
    notes: optional(t.string),
    newOrganizationId: optional(t.number),
    deletedAt: optional(DATE_FROM_STRING),
  }),
]);

export type UpdateOrganizationParams = t.TypeOf<
  typeof UPDATE_ORGANIZATION_PARAMS
>;

export type UpdateOrganizationResult = t.TypeOf<typeof ORGANIZATION>;

export const DELETE_ORGANIZATION_PARAMS = t.type({
  id: t.number,
});
export type DeleteOrganizationParams = t.TypeOf<
  typeof DELETE_ORGANIZATION_PARAMS
>;

export const DELETE_ORGANIZATION_RESULT = t.type({ status: t.literal('ok') });

export type DeleteOrganizationResult = t.TypeOf<
  typeof DELETE_ORGANIZATION_RESULT
>;

export const MERGE_ORGANIZATION_PARAMS = t.type({
  id: INTEGER_FROM_STRING,
});

type MergeOrganizationsParams = t.TypeOf<typeof MERGE_ORGANIZATION_PARAMS>;

export const MERGE_ORGANIZATION_BODY = t.type({
  organizationsToBeMerged: t.array(t.number),
});

type MergeOrganizationsBody = t.TypeOf<typeof MERGE_ORGANIZATION_BODY>;

export const MERGE_ORGANIZATION_RESULT = t.intersection([
  t.type({
    id: t.number,
    active: t.boolean,
    collectiveInd: t.boolean,
    verified: t.boolean,
    name: t.string,
    abbreviation: t.string,
  }),
  t.partial({
    nativeName: t.string,
    url: t.string,
    parentID: t.number,
    comments: t.string,
    newOrganizationId: t.number,
    notes: t.string,
  }),
]);

export type MergeOrganizationResult = t.TypeOf<
  typeof MERGE_ORGANIZATION_RESULT
>;

export interface Model {
  getAutocompleteOrganizations(
    params: GetOrganizationsAutocompleteParams
  ): Promise<GetOrganizationsResult>;
  searchOrganizations(
    params: SearchOrganizationParams
  ): Promise<SearchOrganizationResult>;
  getOrganization(
    params: GetOrganizationParams
  ): Promise<GetOrganizationResult>;
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
    receivingOrganizationID: MergeOrganizationsParams['id'],
    body: MergeOrganizationsBody
  ): Promise<MergeOrganizationResult>;
}
