import * as t from 'io-ts';
import { ARRAY_BUFFER } from './util';

export const FORM_BASE = t.type({
  id: t.number,
  version: t.number,
});

export const FORM_META = t.intersection([
  FORM_BASE,
  t.type({
    name: t.string,
  }),
]);

export type FormMeta = t.TypeOf<typeof FORM_META>;

export const FORM_DEFINITION = t.type(
  {
    languageMap: t.unknown,
    form: t.string,
    model: t.string,
    transformerVersion: t.string,
  },
  'FORM_DEFINITION'
);

export type FormDefinition = t.TypeOf<typeof FORM_DEFINITION>;

export const FORM = t.intersection([
  FORM_META,
  t.type({
    definition: FORM_DEFINITION,
  }),
]);

export type Form = t.TypeOf<typeof FORM>;

export const FORM_FILE_HASH = t.type({
  name: t.string,
  data: t.type({
    fileHash: t.string,
  }),
});

export type FormFileHash = t.TypeOf<typeof FORM_FILE_HASH>;

export const FORM_FILE = t.type({
  name: t.string,
  data: ARRAY_BUFFER,
});

export type FormFile = t.TypeOf<typeof FORM_FILE>;

export const FORM_UPDATE_DATA = t.intersection([
  FORM_BASE,
  t.type({
    data: t.string,
    files: t.array(FORM_FILE),
    finalized: t.union([t.boolean, t.undefined]),
  }),
]);

export type FormUpdateData = t.TypeOf<typeof FORM_UPDATE_DATA>;
