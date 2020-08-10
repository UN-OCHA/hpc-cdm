import * as t from 'io-ts';

declare module 'enketo-core' {
  import { Form } from 'enketo-core';

  export type Form = t.TypeOf<typeof Form>;
}
