import * as t from 'io-ts';
import { DATE_FROM_STRING, optional } from './util';

const COLLECTION = t.keyof({
  fts: null,
  projects: null,
  reports: null,
  rpm: null,
});

type FileAssetCollection = t.TypeOf<typeof COLLECTION>;

const COMMON_PROPERTIES = {
  id: t.number,
  originalname: t.string,
  mimetype: t.string,
  collection: COLLECTION,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  size: optional(t.number),
} as const;

export const FILE_ASSET_ENTITY = t.type({
  ...COMMON_PROPERTIES,
  filename: t.string,
  path: t.string,
});

export const FILE_ASSET_UPLOAD = t.type({
  ...COMMON_PROPERTIES,
  self: t.string,
  file: t.string,
  name: t.string,
});

export const BLOB_TYPE = new t.Type<Blob>(
  'Blob',
  (input: unknown): input is Blob => input instanceof Blob,
  (input, context) =>
    input instanceof Blob ? t.success(input) : t.failure(input, context),
  t.identity
);
type BlobType = t.TypeOf<typeof BLOB_TYPE>;

export type FileUploadResult = t.TypeOf<typeof FILE_ASSET_UPLOAD>;

export const DELETE_FILE_RESULT = t.null;

export interface Model {
  fileUpload(file: FormData): Promise<FileUploadResult>;
  fileDelete(id: number, collection: FileAssetCollection): Promise<null>;
  fileDownload(id: number, collection: FileAssetCollection): Promise<BlobType>;
  uploadXLSX(file: File): Promise<unknown>;
}
