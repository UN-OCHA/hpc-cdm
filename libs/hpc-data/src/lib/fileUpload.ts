import * as t from 'io-ts';

export const FILE_UPLOAD_RESULT = t.type({
  collection: t.string,
  createdAt: t.string,
  file: t.string,
  id: t.number,
  mimestype: t.string,
  name: t.string,
  originalname: t.string,
  self: t.string,
  size: t.number,
  updatedAt: t.string,
});

export const BLOB_TYPE = new t.Type<Blob>(
  'Blob',
  (input: unknown): input is Blob => input instanceof Blob,
  (input, context) =>
    input instanceof Blob ? t.success(input) : t.failure(input, context),
  t.identity
);
export type BlobType = t.TypeOf<typeof BLOB_TYPE>;
export type FileUploadResult = t.TypeOf<typeof FILE_UPLOAD_RESULT>;

export interface Model {
  fileUploadModel(file: File): Promise<FileUploadResult>;
  fileDownloadModel(id: number): Promise<BlobType>;
}
