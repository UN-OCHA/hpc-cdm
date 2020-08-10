import * as t from 'io-ts';

export const FORM_META = t.type({
  id: t.number,
  version: t.string,
});

export type FormMeta = t.TypeOf<typeof FORM_META>;

export const FORM = t.intersection([
  FORM_META,
  t.type({
    name: t.string,
    definition: t.any,
  }),
]);

export type Form = t.TypeOf<typeof FORM>;

export const FORM_SUBMISSION = t.intersection([
  FORM_META,
  t.type({
    data: t.any,
  }),
]);

export type FormSubmission = t.TypeOf<typeof FORM_SUBMISSION>;

export const GET_FORM_SUBMISSION_PARAMS = t.type({
  id: t.number,
});

export type GetFormSubmissionParams = t.TypeOf<
  typeof GET_FORM_SUBMISSION_PARAMS
>;

export interface Model {
  addFormSubmission(submission: FormSubmission): Promise<FormSubmission>;
  getFormSubmission(params: GetFormSubmissionParams): Promise<FormSubmission>;
}
