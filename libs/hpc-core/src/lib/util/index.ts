export const isDefined = <T>(v: T | null | undefined): v is T =>
  v !== null && v !== undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isString = (v: any): v is string => typeof v === 'string';

/**
 * return true if the given object has the given key,
 * can be used as a type guard.
 */
export const hasKey = <K extends string>(
  o: { [k in K]: unknown },
  k: string | undefined | null
): k is K => !!k && Object.keys(o).indexOf(k) > -1;

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

import * as asmCrypto from 'asmcrypto.js';

export const hashFile = (data: Buffer | string) => {
  const hasher = new asmCrypto.Sha256();
  if (typeof data === 'string') {
    hasher.process(
      new Uint8Array(data.length).map((_, i) => data.charCodeAt(i))
    );
  } else {
    hasher.process(data);
  }
  hasher.finish();
  return asmCrypto.bytes_to_hex(hasher.result as Uint8Array);
};
