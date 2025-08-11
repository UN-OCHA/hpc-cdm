import { errors } from '@unocha/hpc-data';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';

export type DataLoaderState<T> =
  | { type: 'loading' }
  | { type: 'not-found' }
  | {
      type: 'error';
      error: string;
      retry: () => void;
    }
  | {
      type: 'success';
      data: T;
      update: (data: T) => void;
    };

type Primitive = string | boolean | number | symbol | null | undefined;

type DepsBaseType = [Primitive, ...Primitive[]] | [{ [id: string]: Primitive }];

export const REQUIRED_BORDER_STYLE = tw`
  [&_fieldset]:border-s-unocha-pallete-orange-dark1
  [&_fieldset]:border-s-4
`;

const hasObjDeps = (
  deps: DepsBaseType
): deps is [{ [id: string]: Primitive }] =>
  deps.length === 1 && typeof deps[0] === 'object';

const hasPrimitivesOnly = (
  deps: DepsBaseType
): deps is [Primitive, ...Primitive[]] =>
  Array.prototype.every.call(
    deps,
    (v: unknown) =>
      typeof v === 'string' ||
      typeof v === 'boolean' ||
      typeof v === 'number' ||
      typeof v === 'symbol' ||
      v === null ||
      v === undefined
  );

/**
 * Using react hooks, return an object that represents an attempt to load data.
 *
 * This loader hook will allow a load to be retried when it fails, and includes
 * an error message when this happens. It will also allow reload when invoking
 * `load()`
 */
export function useDataLoader<Data>(
  dependencies: [],
  get: () => Promise<Data>
): [DataLoaderState<Data>, () => void];
export function useDataLoader<Deps extends DepsBaseType, Data>(
  dependencies: Deps,
  get: (...data: Deps) => Promise<Data>
): [DataLoaderState<Data>, () => void];
export function useDataLoader<Deps extends DepsBaseType, Data>(
  /**
   * What data is this request dependant on? I.E what arguments do you need to
   * send to the given function to complete the request?
   *
   * These arguments are used to calculate whether a new request needs to be
   * made, or whether the existing request is sufficient.
   */
  dependencies: Deps,
  /**
   * What function should be called to retrieve the required data.
   *
   * It is recommended to reference the model function directly, rather than
   * create a lambda function,
   * to avoid forgetting to update dependencies.
   */
  get: (...data: Deps) => Promise<Data>
) {
  const [state, setState] = useState<DataLoaderState<Data>>({
    type: 'loading',
  });
  const setData = (data: Data) =>
    setState({
      type: 'success',
      data,
      update: setData,
    });

  const load = () => {
    setState({ type: 'loading' });
    get(...dependencies)
      .then(setData)
      .catch((error: Error) => {
        if (errors.isNotFoundError(error)) {
          setState({
            type: 'not-found',
          });
        } else if (errors.isUserAbortError(error)) {
          if (state.type !== 'loading') {
            setState({ type: 'loading' });
          }
        } else {
          setState({
            type: 'error',
            error: error.message || error.toString(),
            retry,
          });
        }
      });
  };

  const retry = () => {
    setState({ type: 'loading' });
    load();
  };

  // Flatten dependencies so that react's reference equality matches no changes
  let deps: Primitive[];
  if (hasObjDeps(dependencies)) {
    deps = [];
    for (const [key, value] of Object.entries(dependencies[0])) {
      deps.push(key, value);
    }
  } else if (hasPrimitivesOnly(dependencies)) {
    deps = dependencies;
  } else {
    throw new Error('Invalid dependencies');
  }

  useEffect(load, deps);

  return [state, load]; // Return the load function along with the state
}
