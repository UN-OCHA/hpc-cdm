import { isRight } from 'fp-ts/lib/Either';
import type * as t from 'io-ts';
import { useSearchParams } from 'react-router';

type Props<T> = {
  codec: t.Type<T>;
  initialValues: T;
};

function toURLSearchParams<T>(params: T): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined) {
      searchParams.set(key, String(params[key]));
    }
  }
  return searchParams;
}

function useQueryParams<T extends Record<string, string | number>>({
  codec,
  initialValues,
}: Props<T>) {
  const stringifiedInitialValues: Record<string, string> = {};
  for (const key in initialValues) {
    stringifiedInitialValues[key] = String(initialValues[key]);
  }

  const [searchParams, setSearchParams] = useSearchParams(
    stringifiedInitialValues
  );

  const decodeParams = (params: URLSearchParams): T => {
    const obj: Record<string, string> = {};
    for (const [key, value] of params) {
      if (value !== undefined) {
        obj[key] = value;
      }
    }

    const result = codec.decode(obj);

    if (!isRight(result)) {
      if (Object.keys(obj).length !== 0) {
        console.error('Invalid query params:', result);
        console.warn('Reverting back to initial values...');
      }
      return initialValues;
    }

    return result.right;
  };

  const setValidatedSearchParams = (newParams: T) => {
    const result = codec.decode(newParams);

    if (!isRight(result)) {
      console.error('Invalid parameters to set:', result.left);
      return;
    }
    const validatedParams = toURLSearchParams(newParams);
    setSearchParams(validatedParams);
  };

  return [decodeParams(searchParams), setValidatedSearchParams] as const;
}

export default useQueryParams;
