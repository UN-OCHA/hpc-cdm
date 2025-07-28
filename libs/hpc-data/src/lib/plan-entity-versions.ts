import * as t from 'io-ts';

const PLAN_ENTITY_VERSION_REF = t.partial({
  planEntityIds: t.array(t.number),
  entityPrototypeId: t.number,
});

const PLAN_ENTITY_VERSION_VALUE = t.type({
  categories: t.array(t.number),
  description: t.string,
  type: t.type({
    en: t.type({
      singular: t.string,
      plural: t.string,
    }),
  }),
  support: t.array(PLAN_ENTITY_VERSION_REF),
});

export const PLAN_ENTITY_VERSION = t.type({
  id: t.number,
  planEntityId: t.number,
  customReference: t.string,
  value: PLAN_ENTITY_VERSION_VALUE,
});
