import * as t from 'io-ts';
import { optional } from './util';

export const PLAN_ENTITY = t.type({
  id: t.number,
  planId: t.number,
  entityPrototypeId: t.number,
  parentGoverningEntityId: optional(t.number),
});
