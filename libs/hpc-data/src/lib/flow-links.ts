import * as t from 'io-ts';

export const FLOW_LINK = t.type({
  parentID: t.number,
  childID: t.number,
  depth: t.number,
});
