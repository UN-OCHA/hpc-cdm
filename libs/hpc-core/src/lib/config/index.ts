import * as t from 'io-ts';

export const CONFIG = t.type({
  HPC_AUTH_URL: t.string,
  HPC_AUTH_CLIENT_ID: t.string,
  HPC_API_URL: t.string,
});

export type Config = t.TypeOf<typeof CONFIG>;
