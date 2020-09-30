import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { util } from '@unocha/hpc-core';
import {
  Model,
  forms,
  operations,
  reportingWindows,
  access,
  errors,
  util as dataUtil,
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

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

interface RequestInit {
  method?: HttpMethod;
  headers: {
    [id: string]: string;
  };
  body?: string | ArrayBuffer;
}

interface Response {
  readonly ok: boolean;
  readonly statusText: string;
  json(): Promise<any>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface FetchInterface {
  (input: string, init?: RequestInit): Promise<Response>;
}

interface Config {
  baseUrl: string;
  hidToken: string;
  /**
   * Optionally provide interfaces for implicit browser globals and other
   * functionality that requires a browser, when running in Node.js.
   */
  interfaces?: {
    URL?: URLInterface;
    fetch?: FetchInterface;
    /**
     * Generate a sha256 hash
     */
    sha256Hash?: (data: ArrayBuffer) => Promise<string>;
  };
}

interface Res<T> {
  data: T;
  status: 'ok' | unknown;
}

interface FileInfo {
  name: string;
  data: ArrayBuffer;
  fileHash: string;
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

/**
 * Temporarily store the downloaded files in a map from sha to the binary data.
 *
 * We need this to ensure that we don't need to re-download files every time we
 * save an assignment, or immediately after uploading a file.
 *
 * We can probably improve this by ensuring the cache control headers of the
 * download endpoint are long (the contents should never change).
 *
 * TODO: either:
 *
 * * replace this with something more robust,
 *   using e.g. local storage or database storage to keep the files,
 *   ensuring that we use FIFO with a max number of files / bytes to ensure
 *   we don't take up too much space.
 * * never load files into memory (or pre-download files),
 *   and replace everything with download URLs that auto-expire
 *   after a certain amount of time.
 */
const fileCache = new Map<string, Promise<ArrayBuffer>>();

/**
 * Custom types for endpoints where endpoints aren't directly implementing
 * functions in the model.
 *
 * (e.g. when it's neccesary for single model function to be backed my multiple
 * HTTP endpoints, or where some daya is sent as params and some as body).
 */
export const LIVE_TYPES = {
  ACCESS: {
    /**
     * Query parameters sent for every target-specific access endpoint
     */
    TARGET_ACCESS_PARAMS: t.intersection([
      t.type({
        targetType: t.keyof({
          global: null,
          operation: null,
          operationCluster: null,
        }),
      }),
      t.partial({
        targetId: dataUtil.INTEGER_FROM_STRING,
      }),
    ]),
    /**
     * POST BODY for updateTargetAccess()
     */
    UPDATE_TARGET_ACCESS_BODY: t.type({
      grantee: access.GRANTEE,
      roles: t.array(t.string),
    }),
    /**
     * POST BODY for updateTargetAccessInvite()
     */
    UPDATE_TARGET_ACCESS_INVITE_BODY: t.type({
      email: t.string,
      roles: t.array(t.string),
    }),
    /**
     * POST BODY for addTargetAccess()
     */
    ADD_TARGET_ACCESS_BODY: t.type({
      email: t.string,
      roles: t.array(t.string),
    }),
  },
  REPORTING_WINDOWS: {
    GET_ASSIGNMENT_RESULT: reportingWindows.GET_ASSIGNMENT_RESULT(
      forms.FORM_FILE_HASH
    ),
    UPDATE_ASSIGNMENT_BODY: t.type({
      form: t.intersection([
        forms.FORM_BASE,
        t.type({
          data: t.string,
          finalized: t.boolean,
          files: t.array(
            t.type({
              name: t.string,
              data: t.type({
                fileHash: t.string,
              }),
            })
          ),
        }),
      ]),
    }),
  },
} as const;

export class LiveModel implements Model {
  private readonly config: Config;
  private readonly URL: URLInterface;
  private readonly fetch: FetchInterface;
  private readonly sha256Hash: (data: ArrayBuffer) => Promise<string>;

  public constructor(config: Config) {
    this.config = config;
    this.URL = config.interfaces?.URL || URL;
    this.fetch = config.interfaces?.fetch || fetch.bind(window);
    this.sha256Hash = config.interfaces?.sha256Hash || util.hashFileInBrowser;
  }

  private baseFetchInit = ({
    method,
    pathname,
    queryParams,
  }: {
    method?: HttpMethod;
    pathname: string;
    queryParams?: {
      [id: string]: string;
    };
  }) => {
    const url = new this.URL(this.config.baseUrl);
    url.pathname = pathname;
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value);
      }
    }
    const init: RequestInit = {
      method: method || 'GET',
      headers: {
        Authorization: `Bearer ${this.config.hidToken}`,
      },
    };
    return { url, init };
  };

  private call = async <T>({
    method,
    pathname,
    queryParams,
    resultType,
    body,
  }: {
    method?: HttpMethod;
    pathname: string;
    queryParams?: {
      [id: string]: string;
    };
    resultType: t.Type<T>;
    body?:
      | {
          type: 'json';
          data: unknown;
        }
      | {
          type: 'raw';
          data: string | ArrayBuffer;
          contentType: string;
        };
  }) => {
    const { url, init } = this.baseFetchInit({ pathname, method, queryParams });
    if (body) {
      if (body.type === 'json') {
        init.body = JSON.stringify(body.data);
        init.headers['Content-Type'] = 'application/json';
      } else {
        init.body = body.data;
        init.headers['Content-Type'] = body.contentType;
      }
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
          body: {
            type: 'json',
            data: {
              grantee: params.grantee,
              roles: params.roles,
            },
          },
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
      updateTargetAccessInvite: (params) =>
        this.call({
          method: 'PATCH',
          pathname: `${accessPathnameForTarget(params.target)}/invites`,
          body: {
            type: 'json',
            data: {
              email: params.email,
              roles: params.roles,
            },
          },
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
      addTargetAccess: (params) =>
        this.call({
          method: 'POST',
          pathname: accessPathnameForTarget(params.target),
          body: {
            type: 'json',
            data: {
              email: params.email,
              roles: params.roles,
            },
          },
          resultType: access.GET_TARGET_ACCESS_RESULT,
        }),
    };
  }

  get operations(): operations.Model {
    return {
      getClusters: (params) =>
        this.call({
          pathname: `/v2/operations/${params.operationId}/clusters`,
          resultType: operations.GET_CLUSTERS_RESULT,
        }),
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
    /**
     * Remove all the files from the map that aren't one of these.
     *
     * This ensures the map doesn't get too big,
     * while allowing for quick updates when we're dealing with a single form.
     */
    const keepOnlyGivenFiles = (filesToKeep: string[]) => {
      const set = new Set(filesToKeep);
      for (const key of fileCache.keys()) {
        if (!set.has(key)) {
          fileCache.delete(key);
        }
      }
    };

    const handleAssignmentResult = async (
      result: t.TypeOf<
        typeof LIVE_TYPES['REPORTING_WINDOWS']['GET_ASSIGNMENT_RESULT']
      >
    ): Promise<reportingWindows.GetAssignmentResult> => {
      // Only keep files that are used by this version of the assignment
      keepOnlyGivenFiles(result.task.currentFiles.map((f) => f.data.fileHash));

      // Download / prepare any neccesary fiels
      const currentFiles: reportingWindows.GetAssignmentResult['task']['currentFiles'] = await Promise.all(
        result.task.currentFiles.map(async (f) => {
          let data = fileCache.get(f.data.fileHash);
          if (!data) {
            // Download file
            const { url, init } = this.baseFetchInit({
              pathname: `/v2/reportingwindows/assignments/${result.id}/files/${f.data.fileHash}`,
            });
            const res = await this.fetch(url.href, init);
            data = res.arrayBuffer();
            fileCache.set(f.data.fileHash, data);
          }
          return {
            name: f.name,
            data: await data,
          };
        })
      );

      const r: reportingWindows.GetAssignmentResult = {
        ...result,
        task: {
          ...result.task,
          currentFiles,
        },
      };
      return r;
    };

    return {
      getAssignment: async (params) => {
        const { assignmentId } = params;
        const result = await this.call({
          pathname: `/v2/reportingwindows/assignments/${assignmentId}`,
          resultType: LIVE_TYPES.REPORTING_WINDOWS.GET_ASSIGNMENT_RESULT,
        });
        return handleAssignmentResult(result);
      },
      getAssignmentsForOperation: (params) => {
        const { reportingWindowId: rwId, operationId: opId } = params;
        return this.call({
          pathname: `/v2/reportingwindows/${rwId}/operations/${opId}/assignments`,
          resultType: reportingWindows.GET_ASSIGNMENTS_FOR_OPERATION_RESULT,
        });
      },
      updateAssignment: async (params) => {
        const { assignmentId: aId } = params;

        const files = await Promise.all(
          params.form.files.map(async (f) => ({
            name: f.name,
            data: f.data,
            fileHash: await this.sha256Hash(f.data),
          }))
        );

        keepOnlyGivenFiles(files.map((f) => f.fileHash));

        for (const file of files) {
          fileCache.set(file.fileHash, Promise.resolve(file.data));
        }

        if (files && files.length) {
          const newFiles = await this.checkFormAssignmentFiles(aId, files);
          if (newFiles) {
            await this.uploadFormAssignmentFiles(aId, newFiles);
          }
        }

        const data = {
          ...params,
          form: {
            id: params.form.id,
            version: params.form.version,
            data: params.form.data,
            finalized: params.form.finalized,
            files: files.map((f) => ({
              name: f.name,
              data: { fileHash: f.fileHash },
            })),
          },
        };
        const result = await this.call({
          method: 'PUT',
          body: {
            type: 'json',
            data,
          },
          pathname: `/v2/reportingwindows/assignments/${aId}`,
          resultType: LIVE_TYPES.REPORTING_WINDOWS.GET_ASSIGNMENT_RESULT,
        });
        return handleAssignmentResult(result);
      },
    };
  }

  private async checkFormAssignmentFiles(
    assignmentId: number,
    files: FileInfo[]
  ) {
    const data = {
      fileHashes: files.map((f) => f.fileHash),
    };

    const response = await this.call({
      method: 'POST',
      body: {
        type: 'json',
        data,
      },
      pathname: `/v2/reportingwindows/assignments/${assignmentId}/checkfiles`,
      resultType: reportingWindows.CHECK_FILES_RESULT,
    });

    const { missingFileHashes } = response;
    return files.filter((f) => missingFileHashes.includes(f.fileHash));
  }

  private async uploadFormAssignmentFiles(
    assignmentId: number,
    files: FileInfo[]
  ) {
    for (const f of files) {
      const res = await this.call({
        method: 'POST',
        body: {
          type: 'raw',
          data: f.data,
          contentType: 'application/octet-stream',
        },
        pathname: `/v2/reportingwindows/assignments/${assignmentId}/files`,
        resultType: reportingWindows.UPLOAD_ASSIGNMENT_FILE_RESULT,
      });
    }
  }
}
