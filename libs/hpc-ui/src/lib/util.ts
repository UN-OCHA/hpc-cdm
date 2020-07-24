import { useState, useEffect } from 'react';

export type DataLoaderState<T> =
  | { type: 'loading' }
  | {
      type: 'error';
      error: string;
      retry: () => void;
    }
  | { type: 'success'; data: T };

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
/**
 * Using react hooks, return an object that represents an attempt to load data.
 *
 * This loader will allow a load to be retried when it fails, and includes
 * an error message when this happens.
 */
export function dataLoader<Data>(
  dependencies: [],
  get: () => Promise<Data>
): DataLoaderState<Data>;
export function dataLoader<Deps extends [unknown, ...unknown[]], Data>(
  dependencies: Deps,
  get: (...data: Deps) => Promise<Data>
): DataLoaderState<Data>;
export function dataLoader<Deps extends [unknown, ...unknown[]], Data>(
  /**
   * What data is this request dependant on? I.E what arguments do you need to
   * send to the given function to complete the request?
   *
   * These arguments are used to calculate whether a new request needs to be
   * made, or whether the existing request is sufficient.
   */
  dependencies: Deps,
  /**
   * What function should be called to retreive the required data.
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

  // TODO: add retry logic

  const load = () => {
    get(...dependencies)
      .then((data) => setState({ type: 'success', data }))
      .catch((err: Error) =>
        setState({
          type: 'error',
          error: err.message || err.toString(),
          retry,
        })
      );
  };

  const retry = () => {
    setState({ type: 'loading' });
    load();
  };

  useEffect(load, dependencies);

  return state;
}
/* eslint-enable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
