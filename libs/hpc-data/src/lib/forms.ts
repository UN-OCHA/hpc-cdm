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

export enum InputEntryCategoriesEnum {
  ACTIVE_FLOW = 'activeFlow',
  EXTERNAL = 'external',
}

export enum InputEntryKindsEnum {
  NEW = 'new',
  DELETED = 'deleted',
  REVISED = 'revised',
  UNMATCHED = 'unmatched',
}

const InputEntryCategoriesCodec = t.union([
  t.literal(InputEntryCategoriesEnum.ACTIVE_FLOW),
  t.literal(InputEntryCategoriesEnum.EXTERNAL),
]);

const InputEntryKindsCodec = t.union([
  t.literal(InputEntryKindsEnum.NEW),
  t.literal(InputEntryKindsEnum.DELETED),
  t.literal(InputEntryKindsEnum.REVISED),
  t.literal(InputEntryKindsEnum.UNMATCHED),
]);

const InputSelectValueTypeCodec = t.intersection([
  t.type({
    value: t.union([t.string, t.number]),
    displayLabel: t.string,
  }),
  t.partial({
    isAutoFilled: t.boolean,
    isTransferred: t.boolean,
    isInferred: t.boolean,
    restricted: t.boolean,
  }),
]);

export const INPUT_SELECT_VALUE_TYPE = InputSelectValueTypeCodec;
export type InputSelectValueType = t.TypeOf<typeof INPUT_SELECT_VALUE_TYPE>;

const InputEntryTypeCodec = t.type({
  category: InputEntryCategoriesCodec,
  value: t.union([
    t.array(InputSelectValueTypeCodec),
    InputSelectValueTypeCodec,
    t.string,
    t.number,
    t.null,
  ]),
  kind: InputEntryKindsCodec,
});

export const INPUT_ENTRY_TYPE = InputEntryTypeCodec;
export type InputEntryType = t.TypeOf<typeof INPUT_ENTRY_TYPE>;
