import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  Model,
  operations,
  reportingWindows,
  access,
  errors,
} from '@unocha/hpc-data';
interface URLInterface {
  new (url: string): {
    pathname: string;
    href: string;
    searchParams: {
      set: (name: string, value: string) => void;
    };
  };
}

type HttpMethod = 'POST' | 'PUT' | 'PATCH';

interface RequestInit {
  method?: HttpMethod;
  headers: {
    [id: string]: string;
  };
  body?: string;
}

interface Response {
  readonly ok: boolean;
  readonly statusText: string;
  json(): Promise<any>;
}

interface FetchInterface {
  (input: string, init?: RequestInit): Promise<Response>;
}

interface Config {
  baseUrl: string;
  hidToken: string;
  /**
   * Optionally provide interfaces for implicit browser globals when running
   * in a Node.js environment.
   */
  interfaces?: {
    URL?: URLInterface;
    fetch?: FetchInterface;
  };
}

interface Res<T> {
  data: T;
  status: 'ok' | unknown;
}

const MODEL_ERROR = Symbol('ModelError');

export class ModelError extends Error {
  public readonly code = MODEL_ERROR;
  public readonly json: any;

  public constructor(message: string, json: any) {
    super(message);
    this.json = json;
  }
}

export const isModelError = (value: unknown): value is ModelError =>
  value instanceof Error && (value as ModelError).code === MODEL_ERROR;

export class LiveModel implements Model {
  private readonly config: Config;
  private readonly URL: URLInterface;
  private readonly fetch: FetchInterface;

  public constructor(config: Config) {
    this.config = config;
    this.URL = config.interfaces?.URL || URL;
    this.fetch = config.interfaces?.fetch || fetch.bind(window);
  }

  private call = async <T>({
    method,
    data,
    pathname,
    queryParams,
    resultType,
  }: {
    method?: HttpMethod;
    data?: unknown;
    pathname: string;
    queryParams?: {
      [id: string]: string;
    };
    resultType: t.Type<T>;
  }) => {
    const url = new this.URL(this.config.baseUrl);
    url.pathname = pathname;
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value);
      }
    }
    const init: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.config.hidToken}`,
      },
    };
    if (method) {
      init.method = method;
    }
    if (data) {
      init.body = JSON.stringify(data);
      init.headers['Content-Type'] = 'application/json';
    }
    const res = await this.fetch(url.href, init);
    if (res.ok) {
      const json: Res<T> = await res.json();
      const decode = resultType.decode(json.data);
      if (isRight(decode)) {
        return decode.right;
      } else {
        const report = PathReporter.report(decode);
        console.error('Received unexpected result from server', report, json);
        throw new ModelError('Received unexpected result from server', json);
      }
    } else {
      const json = await res.json();
      if (
        json?.code === 'BadRequestError' &&
        errors.USER_ERROR_KEYS.includes(json?.message)
      ) {
        throw new errors.UserError(json.message);
      } else {
        const message =
          json?.code && json?.message
            ? `${json.code}: ${json.message}`
            : res.statusText;
        throw new ModelError(message, json);
      }
    }
  };

  get access(): access.Model {
    const accessPathnameForTarget = (target: access.AccessTarget) =>
      `/v2/access/${
        target.type === 'global'
          ? 'global'
          : `${target.type}/${target.targetId}`
      }`;

    return {
      getTargetAccess: (params) =>
        this.call({
          pathname: accessPathnameForTarget(params.target),
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
      updateTargetAccess: (params) =>
        this.call({
          method: 'PATCH',
          pathname: accessPathnameForTarget(params.target),
          data: {
            grantee: params.grantee,
            roles: params.roles,
          },
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
      updateTargetAccessInvite: (params) =>
        this.call({
          method: 'PATCH',
          pathname: `${accessPathnameForTarget(params.target)}/invites`,
          data: {
            email: params.email,
            roles: params.roles,
          },
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
      addTargetAccess: (params) =>
        this.call({
          method: 'POST',
          pathname: accessPathnameForTarget(params.target),
          data: {
            email: params.email,
            roles: params.roles,
          },
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
    };
  }

  get operations(): operations.Model {
    return {
      getClusters: () => Promise.reject(new Error('not implemented')),
      getOperations: () =>
        this.call({
          pathname: `/v2/operations`,
          resultType: operations.GET_OPERATIONS_RESULT,
        }),
      getOperation: (params) =>
        this.call({
          pathname: `/v2/operations/${params.id}`,
          resultType: operations.GET_OPERATION_RESULT,
        }),
    };
  }

  get reportingWindows(): reportingWindows.Model {
    return {
      getAssignment: () => Promise.reject(new Error('not implemented')),
      getAssignmentsForOperation: () =>
        Promise.reject(new Error('not implemented')),
      updateAssignment: (params: reportingWindows.UpdateAssignmentParams) =>
        Promise.reject(new Error('not implemented')),
    };
  }
}
