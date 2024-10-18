import * as t from 'io-ts';

export const GOVERNING_ENTITY = t.type({
  id: t.number,
  planId: t.number,
  entityPrototypeId: t.number,
});

export type GoverningEntity = t.TypeOf<typeof GOVERNING_ENTITY>;

export const GOVERNING_ENTITY_VERSION = t.type({
  id: t.number,
  governingEntityId: t.number,
  name: t.string,
  customReference: t.string,
});

export type GoverningEntityVersion = t.TypeOf<typeof GOVERNING_ENTITY_VERSION>;
