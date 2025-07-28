import * as t from 'io-ts';
import { DATE_FROM_STRING } from './util';

const CATEGORY_REF_OBJECT_TYPE = t.keyof({
  emergency: null,
  flow: null,
  location: null,
  organization: null,
  plan: null,
  projectVersion: null,
  reportDetail: null,
});

export const CATEGORY_REF = t.type({
  objectID: t.number,
  objectType: CATEGORY_REF_OBJECT_TYPE,
  categoryID: t.number,
  versionID: t.number,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
});
