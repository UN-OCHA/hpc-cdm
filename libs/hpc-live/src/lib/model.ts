import { Model, operations, reportingWindows } from '@unocha/hpc-data';

interface Config {
  baseUrl: string;
  hidToken: string;
}

export class LiveModel implements Model {
  private readonly config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  private call = async <T>({ pathname }: { pathname: string }) => {
    const url = new URL(this.config.baseUrl);
    url.pathname = pathname;
    const init: RequestInit = {
      headers: {
        Authorization: `Credentials ${this.config.hidToken}`,
      },
    };
    const res = await fetch(url.href, init);
    if (res.ok) {
      return await res.json();
    } else {
      throw new Error(res.statusText);
    }
  };

  get operations(): operations.Model {
    return {
      getClusters: () => Promise.reject(new Error('not implemented')),
      getOperations: () =>
        this.call({
          pathname: `/v2/operation`,
        }),
      getOperation: (params) => Promise.reject(new Error('not implemented')),
    };
  }

  get reportingWindows(): reportingWindows.Model {
    return {
      getAssignment: () => Promise.reject(new Error('not implemented')),
      getAssignmentsForOperation: () =>
        Promise.reject(new Error('not implemented')),
    };
  }
}
