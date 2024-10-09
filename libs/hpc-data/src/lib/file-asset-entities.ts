import * as t from 'io-ts';

const COLLECTION = t.union([
  t.literal('fts'),
  t.literal('projects'),
  t.literal('reports'),
  t.literal('rpm'),
]);

type FileAssetCollection = t.TypeOf<typeof COLLECTION>;

const COMMON_PROPERTIES = {
  id: t.number,
  originalname: t.string,
  size: t.union([t.number, t.null]),
  mimetype: t.string,
  collection: COLLECTION,
  createdAt: t.string,
  updatedAt: t.string,
} as const;

export const FILE_ASSET_ENTITY = t.type({
  ...COMMON_PROPERTIES,
  filename: t.string,
  path: t.string,
});

export const FILE_ASSET_UPLOAD = t.type({
  id: t.number,
  originalname: t.string,
  size: t.union([t.number, t.null]),
  mimetype: t.string,
  collection: COLLECTION,
  createdAt: t.string,
  updatedAt: t.string,
  self: t.string,
  file: t.string,
  name: t.string,
});

//  TODO: REVIEW MATYAS' CODE >.<

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
}
