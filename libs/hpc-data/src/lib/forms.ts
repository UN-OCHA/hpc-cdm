import * as t from 'io-ts';

export const FORM_META = t.type({
  id: t.number,
  name: t.string,
});

export type FormMeta = t.TypeOf<typeof FORM_META>;

export const FORM = t.intersection([
  FORM_META,
  t.type({
    /**
     * TODO: flesh this out with enketo definition types
     */
    definition: t.string,
  }),
]);

export type Form = t.TypeOf<typeof FORM>;
