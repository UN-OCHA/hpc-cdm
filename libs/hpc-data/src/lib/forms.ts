import * as t from 'io-ts';

const FORM_BASE = t.type({
  id: t.number,
  version: t.string,
});

export const FORM_META = t.intersection([
  FORM_BASE,
  t.type({
    name: t.string,
  }),
]);

export type FormMeta = t.TypeOf<typeof FORM_META>;

export const FORM = t.intersection([
  FORM_META,
  t.type({
    definition: t.any,
  }),
]);

export type Form = t.TypeOf<typeof FORM>;

export const FORM_FILE = t.type({
  name: t.string,
  url: t.string,
});

export type FormFile = t.TypeOf<typeof FORM_FILE>;

export const FORM_DATA = t.intersection([
  FORM_BASE,
  t.type({
    data: t.any,
    files: t.array(FORM_FILE),
  }),
]);

export type FormData = t.TypeOf<typeof FORM_DATA>;

export const FORM_UPDATE_DATA = t.intersection([
  FORM_DATA,
  t.type({
    blobs: t.array(t.any),
  }),
]);

export type FormUpdateData = t.TypeOf<typeof FORM_UPDATE_DATA>;
