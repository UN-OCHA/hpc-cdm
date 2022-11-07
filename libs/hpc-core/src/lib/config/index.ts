import * as t from 'io-ts';

export const CONFIG = t.intersection([
  t.type({
    hpcAuthUrl: t.string,
    hpcAuthClientId: t.string,
    hpcApiUrl: t.string,
  }),
  // These are optional so that no changes are required to CDM for now
  t.partial({
    ftsAdminBaseUrl: t.string,
    rpmBaseUrl: t.string,
    prismBaseUrl: t.string,
    ftsWebsiteBaseUrl: t.string,
    helpUrl: t.string,
  }),
]);

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
