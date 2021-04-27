import * as t from 'io-ts';

export const resultWithPermissions = <D, P extends { [id: string]: boolean }>(
  data: t.Type<D>,
  permissions: t.Type<P>
) => t.type({ data, permissions });

const INTEGER_REGEX = /^[0-9]+$/;

/**
 * Accepts either an integer, or a string of an integer, serializes to a number.
 */
export const INTEGER_FROM_STRING = new t.Type<number, number>(
  'INTEGER_FROM_STRING',
  t.number.is,
  (v, c) => {
    if (typeof v === 'number') {
      return Number.isInteger(v) ? t.success(v) : t.failure(v, c);
    } else if (typeof v === 'string') {
      return INTEGER_REGEX.test(v) ? t.success(parseInt(v)) : t.failure(v, c);
    } else {
      return t.failure(v, c);
    }
  },
  t.identity
);

/**
 * Accepts either an integer array, or a string of comma separated integers.
 */
export const INTEGER_ARRAY_FROM_STRING = new t.Type<number[], number[]>(
  'INTEGER_ARRAY_FROM_STRING',
  t.array(t.number).is,
  (v, c) => {
    if (Array.isArray(v)) {
      return v.every((val) => Number.isInteger(val))
        ? t.success(v)
        : t.failure(v, c);
    } else if (typeof v === 'string') {
      const nums = v.split(',');
      return nums.every((n) => INTEGER_REGEX.test(n))
        ? t.success(nums.map((n) => parseInt(n)))
        : t.failure(v, c);
    } else {
      return t.failure(v, c);
    }
  },
  t.identity
);

/**
 * Accepts either a boolean, or a string of a boolean.
 */
export const BOOLEAN_FROM_STRING = new t.Type<boolean, boolean>(
  'BOOLEAN_FROM_STRING',
  t.boolean.is,
  (v, c) => {
    if (typeof v === 'boolean') {
      return t.success(v);
    } else if (typeof v === 'string') {
      switch (v.toLowerCase()) {
        case 'false':
        case '0':
        case '':
          return t.success(false);
        case 'true':
        case '1':
          return t.success(true);
        default:
          return t.failure(v, c);
      }
    } else {
      return t.failure(v, c);
    }
  },
  t.identity
);

/**
 * A file BLOB
 */
export const BLOB = new t.Type<Blob, Blob>(
  'BLOB',
  (v): v is Blob => v instanceof Blob,
  (v, c) => {
    if (v instanceof Blob) {
      return t.success(v);
    } else {
      return t.failure(v, c);
    }
  },
  t.identity
);

/**
 * A file Buffer
 */
export const ARRAY_BUFFER = new t.Type<ArrayBuffer, ArrayBuffer>(
  'ArrayBuffer',
  (v): v is ArrayBuffer => v instanceof ArrayBuffer,
  (v, c) => {
    if (v instanceof ArrayBuffer) {
      return t.success(v);
    } else {
      return t.failure(v, c);
    }
  },
  t.identity
);
