import * as t from 'io-ts';

export const PROJECT_VERSION = t.type({
  id: t.number,
  name: t.string,
});

export type ProjectVersion = t.TypeOf<typeof PROJECT_VERSION>;
