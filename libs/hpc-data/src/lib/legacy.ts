import * as t from 'io-ts';
import { DATE_FROM_STRING } from './util';

export const LEGACY = t.type({
  createdAt: DATE_FROM_STRING,
  legacyID: t.number,
  objectID: t.number,
  objectType: t.string,
  updatedAt: DATE_FROM_STRING,
});
