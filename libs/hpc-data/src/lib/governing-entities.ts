import * as t from 'io-ts';
import { GOVERNING_ENTITY_VERSION } from './governingEntityVersion';

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

export const GOVERNING_ENTITY = t.intersection([
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
  }),
  t.partial({
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
    versionTags: t.union([t.array(t.string), t.null]),
    deletedAt: t.union([t.string, t.null]),
    tags: t.union([t.array(t.string), t.null]),
    governigEntityVersions: t.array(GOVERNING_ENTITY_VERSION),
  }),
]);

const GET_GOVERNING_ENTITIES_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type GoverningEntity = t.TypeOf<typeof GOVERNING_ENTITY>;

export const GET_GOVERNING_ENTITIES_RESULT = t.array(GOVERNING_ENTITY);

export type GetGoverningEntitiesAutocompleteParams = t.TypeOf<
  typeof GET_GOVERNING_ENTITIES_AUTOCOMPLETE_PARAMS
>;

export type GetGoverningEntitiesResult = t.TypeOf<
  typeof GET_GOVERNING_ENTITIES_RESULT
>;

export interface Model {
  getGoverningEntitiesAutocomplete(
    params: GetGoverningEntitiesAutocompleteParams
  ): Promise<GetGoverningEntitiesResult>;
}
