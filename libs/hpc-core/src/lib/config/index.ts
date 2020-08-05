import * as t from 'io-ts';

export const CONFIG = t.type({
  hpcAuthUrl: t.string,
  hpcAuthClientId: t.string,
  hpcApiUrl: t.string,
});

export type Config = t.TypeOf<typeof CONFIG>;

/**
 * Check that the given value has the correct config type,
 * and that the values are also set and valid.
 */
export const isValid = (config: unknown): config is Config => {
  if (!CONFIG.is(config)) {
    return false;
  }
  if (!config.hpcApiUrl || !config.hpcAuthClientId || !config.hpcAuthUrl) {
    return false;
  }
  return true;
};
