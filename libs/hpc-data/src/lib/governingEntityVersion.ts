import * as t from 'io-ts';

export const GOVERNING_ENTITY_VERSION = t.type({
  id: t.number,
  name: t.string,
});

export type GoverningEntityVersion = t.TypeOf<typeof GOVERNING_ENTITY_VERSION>;
