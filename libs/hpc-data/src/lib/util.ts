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
