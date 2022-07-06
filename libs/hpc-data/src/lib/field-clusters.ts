import * as t from 'io-ts';

const ENTITY_PROTOTYPE = t.type({
  id: t.number,
  refCode: t.string,
  value: t.intersection([
    t.type({
      name: t.type({
        en: t.type({
          singular: t.string,
          plural: t.string,
        }),
      }),
    }),
    t.partial({
      possibleChildren: t.union([
        t.array(
          t.type({
            refCode: t.string,
            cardinality: t.string,
            id: t.number,
          })
        ),
        t.null,
      ]),
    }),
  ]),
  type: t.string,
  planId: t.number,
  orderNumber: t.number,
  createdAt: t.string,
  updatedAt: t.string,
});

const FIELD_CLUSTER = t.intersection([
  t.type({
    id: t.number,
    planId: t.number,
    entityPrototypeId: t.number,
    entityType: t.string,
    currentVersion: t.boolean,
    latestVersion: t.boolean,
    latestTaggedVersion: t.boolean,
    createdAt: t.string,
    updatedAt: t.string,
    governingEntityVersionId: t.number,
    governingEntityId: t.number,
    name: t.string,
    customReference: t.string,
    overriding: t.boolean,
    clusterNumber: t.string,
    entityPrototype: ENTITY_PROTOTYPE,
    value: t.union([
      t.type({
        icon: t.string,
        orderNumber: t.number,
      }),
      t.partial({ categories: t.union([t.array(t.unknown), t.null]) }),
    ]),
  }),
  t.partial({
    versionTags: t.union([t.array(t.string), t.null]),
    deletedAt: t.union([t.string, t.null]),
    tags: t.union([t.array(t.string), t.null]),
  }),
]);

const GET_FIELD_CLUSTERS_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type FieldCluster = t.TypeOf<typeof FIELD_CLUSTER>;

export const GET_FIELD_CLUSTERS_RESULT = t.array(FIELD_CLUSTER);

export type GetFieldClustersAutocompleteParams = t.TypeOf<
  typeof GET_FIELD_CLUSTERS_AUTOCOMPLETE_PARAMS
>;

export type GetFieldClustersResult = t.TypeOf<typeof GET_FIELD_CLUSTERS_RESULT>;

export interface Model {
  getFieldClustersAutocomplete(
    params: GetFieldClustersAutocompleteParams
  ): Promise<GetFieldClustersResult>;
}
