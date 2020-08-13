import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { Model, operations, reportingWindows } from '@unocha/hpc-data';
interface URLInterface {
  new (url: string): {
    pathname: string;
    href: string;
  };
}

interface RequestInit {
  headers: {
    Authorization: string;
  };
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
    pathname,
    resultType,
  }: {
    pathname: string;
    resultType: t.Type<T>;
  }) => {
    const url = new this.URL(this.config.baseUrl);
    url.pathname = pathname;
    const init: RequestInit = {
      headers: {
        Authorization: `Credentials ${this.config.hidToken}`,
      },
    };
    const res = await this.fetch(url.href, init);
    if (res.ok) {
      const json: Res<T> = await res.json();
      const decode = resultType.decode(json.data);
      if (isRight(decode)) {
        return decode.right;
      } else {
        const report = PathReporter.report(decode);
        console.error('Received unexpected result from server', report, json);
        throw new Error('Received unexpected result from server');
      }
    } else {
      throw new Error(res.statusText);
    }
  };

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
