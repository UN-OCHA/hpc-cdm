import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { util } from '@unocha/hpc-core';
import {
  Model,
  forms,
  flows,
  locations,
  organizations,
  operations,
  reportingWindows,
  access,
  errors,
  util as dataUtil,
  categories,
  plans,
  projects,
  emergencies,
  systems,
  globalClusters,
  usageYears,
  currencies,
} from '@unocha/hpc-data';
import { searchFlowsParams } from './utils';
interface URLInterface {
  new (url: string): {
    pathname: string;
    href: string;
    searchParams: {
      set: (name: string, value: string) => void;
    };
  };
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
interface RequestInit {
  method?: HttpMethod;
  headers: {
    [id: string]: string;
  };
  body?: string | ArrayBuffer;
  signal?: AbortSignal;
}

interface Response {
  readonly ok: boolean;
  readonly statusText: string;
  json(): Promise<unknown>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface FetchInterface {
  (input: string, init?: RequestInit): Promise<Response>;
}

interface Config {
  baseUrl: string;
  /**
   * A token to use with the API requests,
   * or null to use the API unauthenticated
   */
  hidToken: string | null;
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
  /**
   * When it is detected that the token / auth session currently being used by
   * the user is invalid (e.g. the token has expired), then this function is
   * called to clear the storage for that auth session, and refresh the page,
   * allowing the user to log in again.
   *
   * This should not log the user out of any respective oauth provider,
   * or redirect the user to a provider.
   */
  clearSessionStorage: () => void;
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
  public readonly json: unknown;

  public constructor(message: string, json: unknown) {
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
 * (e.g. when it's necessary for single model function to be backed my multiple
 * HTTP endpoints, or where some data is sent as params and some as body).
 */

const UPDATE_ASSIGNMENT_BODY_VALUES = t.type({
  previousVersion: t.number,
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
});

const UPDATE_ASSIGNMENT_BODY_STATE_CHANGE = t.type({
  state: t.type({
    type: t.keyof({
      raw: null,
      clean: null,
    }),
    finalized: t.boolean,
  }),
});

export const LIVE_TYPES = {
  ACCESS: {
    /**
     * Query parameters sent for every target-specific access endpoint
     */
    TARGET_ACCESS_PARAMS: t.intersection([
      t.type({
        targetType: t.keyof({
          global: null,
          project: null,
          operation: null,
          operationCluster: null,
          plan: null,
          governingEntity: null,
        }),
      }),
      t.partial({
        targetId: dataUtil.POSITIVE_INTEGER_FROM_STRING,
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
    UPDATE_ASSIGNMENT_BODY: t.union([
      UPDATE_ASSIGNMENT_BODY_VALUES,
      UPDATE_ASSIGNMENT_BODY_STATE_CHANGE,
    ]),
    UPDATE_ASSIGNMENT_BODY_STATE_CHANGE,
  },
} as const;

export class LiveModel implements Model {
  private readonly config: Config;
  private readonly URL: URLInterface;
  private readonly fetch: FetchInterface;
  private readonly sha256Hash: (data: ArrayBuffer) => Promise<string>;

  private readonly searchFlowFields = `flows {
    id
    updatedAt
    amountUSD
    versionID
    activeStatus
    restricted
    exchangeRate
    flowDate
    newMoney
    decisionDate
    categories {
      id
      name
      group
      createdAt
      updatedAt
      description
      parentID
      code
      includeTotals
      categoryRef {
        objectID
        versionID
        objectType
        categoryID
        updatedAt
      }
    }

    organizations {
      id
      name
      direction
      abbreviation
    }

    destinationOrganizations {
      id
      name
      direction
      abbreviation
    }

    sourceOrganizations {
      id
      name
      direction
      abbreviation
    }

    plans {
      id
      name
      direction
    }

    usageYears {
      year
      direction
    }
    childIDs
    parentIDs
    origAmount
    origCurrency
    locations{
      id
      name
      direction
    }
    externalReferences {
      systemID
      flowID
      externalRecordID
      externalRecordDate
      versionID
      createdAt
      updatedAt
    }
    reportDetails {
      id
      flowID
      versionID
      contactInfo
      refCode
      organizationID
      channel
      source
      date
      verified
      updatedAt
      createdAt
      sourceID
    }
    parkedParentSource{
      orgName
      organization
    }
  }`;

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
      headers: this.config.hidToken
        ? {
            Authorization: `Bearer ${this.config.hidToken}`,
          }
        : {},
    };
    return { url, init };
  };

  private call = async <T>({
    method,
    pathname,
    queryParams,
    resultType,
    body,
    signal,
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
    signal?: AbortSignal;
  }) => {
    const { url, init } = this.baseFetchInit({ pathname, method, queryParams });
    init.signal = signal;
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
      const json: Res<T> = (await res.json()) as Res<T>;
      const decode = resultType.decode(json.data);
      if (isRight(decode)) {
        return decode.right;
      } else {
        const report = PathReporter.report(decode);
        console.error('Received unexpected result from server', report, json);
        throw new ModelError('Received unexpected result from server', json);
      }
    } else {
      const json = (await res.json()) as {
        timestamp: Date;
        otherUser: string;
        code?: string;
        message: errors.UserErrorKey;
        details?: {
          code: string;
          detail: string;
          table: string;
        };
      };
      if (json?.code === 'ConflictError') {
        throw new errors.ConflictError(json.timestamp, json.otherUser);
      } else if (
        json?.code === 'BadRequestError' &&
        errors.USER_ERROR_KEYS.includes(json?.message)
      ) {
        throw new errors.UserError(json.message);
      } else if (
        json?.code === 'BadRequestError' &&
        json.details?.code === '23505' && // error code for duplicate primary key
        json.details.detail &&
        json.details.table
      ) {
        throw new errors.DuplicateError(
          json.details.detail,
          json.details.table
        );
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
      getOwnAccess: () =>
        this.call({
          pathname: `/v2/access/self`,
          resultType: access.GET_OWN_ACCESS_RESULT,
        }).catch((err) => {
          if (
            ((err as ModelError)?.json as { code: string })?.code ===
            'ForbiddenError'
          ) {
            // If a 403 error occurred with this endpoint,
            // the auth token has probably expired, so clear storage and refresh
            this.config.clearSessionStorage();
          }
          throw err;
        }),
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

  get categories(): categories.Model {
    return {
      getCategories: (params) =>
        this.call({
          pathname: '/v2/category',
          queryParams: {
            group: params.query,
          },
          resultType: categories.GET_CATEGORIES_RESULT,
        }),
      getKeywords: () =>
        this.call({
          pathname: '/v2/category',
          queryParams: {
            group: 'keywords',
            scopes: 'relatedCount',
          },
          resultType: categories.GET_KEYWORDS_RESULT,
        }),
      deleteKeyword: (params) =>
        this.call({
          pathname: `/v2/category/${params.id}`,
          method: 'DELETE',
          resultType: categories.DELETE_KEYWORD_RESULT,
        }),
      updateKeyword: (params) =>
        this.call({
          pathname: `/v2/category/${params.id}`,
          method: 'PUT',
          body: {
            type: 'json',
            data: { data: { ...params } },
          },
          resultType: categories.CATEGORY,
        }),
      mergeKeywords: (params) =>
        this.call({
          pathname: `v2/category/merge/${params.receivingKeywordID}/${params.mergingKeywordID}`,
          method: 'GET',
          resultType: categories.MERGE_KEYWORD_RESULT,
        }),
    };
  }
  get currencies(): currencies.Model {
    return {
      getCurrencies: () =>
        this.call({
          pathname: `/v1/currency`,
          resultType: currencies.GET_CURRENCIES_RESULT,
        }),
    };
  }
  get emergencies(): emergencies.Model {
    return {
      getAutocompleteEmergencies: (params) =>
        this.call({
          pathname: `/v1/object/autocomplete/emergency/${params.query}`,
          resultType: emergencies.GET_EMERGENCIES_AUTOCOMPLETE_RESULT,
        }),
    };
  }
  get systems(): systems.Model {
    return {
      getSystems: () =>
        this.call({
          pathname: '/v1/external/systems',
          resultType: systems.GET_SYSTEMS_RESULT,
        }),
    };
  }
  get flows(): flows.Model {
    return {
      getFlowREST: (params) =>
        this.call({
          pathname: `/v2/flow/${params.id}`,
          resultType: flows.GET_FLOW_RESULT,
        }),
      getFlow: (params) =>
        this.call({
          pathname: `/v4/graphql`,
          method: 'POST',
          body: {
            type: 'raw',
            data: ` query Flow{
              flow(id: ${params}) {
                  createdAt
                  updatedAt
                  deletedAt
                  id
                  versionID
                  amountUSD
                  flowDate
                  decisionDate
                  firstReportedDate
                  budgetYear
                  origAmount
                  origCurrency
                  exchangeRate
                  activeStatus
                  newMoney
                  restricted
                  description
                  notes
                  versionStartDate
                  versionEndDate
                  createdBy
                  lastUpdatedBy
              }
          }`,
            contentType: 'application/json; charset=utf-8',
          },
          resultType: flows.GET_FLOW_RESULT,
        }),
      getAutocompleteFlows: (params) =>
        this.call({
          pathname: `/v1/object/autocomplete/id/flow/${params.query}`,
          resultType: flows.GET_FLOWS_AUTOCOMPLETE_RESULT,
        }),
      /**
       * TODO: Dynamically fetch only necessary fields, Ex: if we don't display 'NewMoney' we shouldn't ask for it
       */
      searchFlows: (params) => {
        const query = `query {
          searchFlows${searchFlowsParams(params)} {
            total
            
            prevPageCursor
        
            hasNextPage
        
            nextPageCursor
        
            hasPreviousPage
        
            pageSize

            ${this.searchFlowFields}
          }
        }`;
        return this.call({
          pathname: `/v4/graphql`,
          method: 'POST',
          body: {
            type: 'json',
            data: {
              query: query,
            },
          },
          signal: params.signal,
          resultType: flows.SEARCH_FLOWS_RESULT,
        });
      },
      bulkRejectPendingFlows: (params) =>
        this.call({
          pathname: `/v1/flow/bulkupdatestatus/87`,
          method: 'POST',
          body: {
            type: 'json',
            data: params,
          },
          resultType: flows.BULK_REJECT_PENDING_FLOWS_RESULT,
        }),
      getFlowsDownloadXLSX: (params) => {
        const query = `query {
          searchFlowsBatches${searchFlowsParams(params)} {
            ${this.searchFlowFields}
          }
        }`;
        return this.call({
          pathname: `/v4/graphql`,
          method: 'POST',
          body: {
            type: 'json',
            data: {
              query: query,
            },
          },
          signal: params.signal,
          resultType: flows.SEARCH_FLOWS_BATCHES_RESULT,
        });
      },
      createFlow: (params) => {
        return this.call({
          pathname: '/v1/flow/create',
          method: 'POST',
          body: {
            type: 'json',
            data: params,
          },
          resultType: flows.GET_FLOW_RESULT,
        });
      },
    };
  }
  get globalClusters(): globalClusters.Model {
    return {
      getGlobalClusters: () =>
        this.call({
          pathname: '/v1/global-cluster',
          resultType: globalClusters.GET_GLOBAL_CLUSTERS_RESULT,
        }),
    };
  }
  get locations(): locations.Model {
    return {
      getAutocompleteLocations: (params) =>
        this.call({
          pathname: `/v1/location/autocomplete/${params.query}`,
          resultType: locations.GET_LOCATIONS_AUTOCOMPLETE_RESULT,
        }),
    };
  }
  get organizations(): organizations.Model {
    return {
      getAutocompleteOrganizations: (params) =>
        this.call({
          pathname: `/v1/object/autocomplete/organization/${params.query}`,
          resultType: organizations.GET_ORGANIZATIONS_RESULT,
        }),
      searchOrganizations: (params) =>
        this.call({
          pathname: '/v1/organization/search',
          method: 'POST',
          body: {
            type: 'json',
            data: params,
          },
          resultType: organizations.SEARCH_ORGANIZATION_RESULT,
        }),
      getOrganization: (params) =>
        this.call({
          pathname: `/v1/organization/id/${params.id}`,
          method: 'GET',
          resultType: organizations.ORGANIZATION,
        }),
      createOrganization: (params) =>
        this.call({
          pathname: '/v1/organization/create',
          method: 'POST',
          body: {
            type: 'json',
            data: params,
          },
          resultType: organizations.CREATE_ORGANIZATION_RESULT,
        }),
      updateOrganization: (params) =>
        this.call({
          pathname: `/v1/organization/update/${params.id}`,
          method: 'PUT',
          body: {
            type: 'json',
            data: { organization: { ...params } },
          },
          resultType: organizations.UPDATE_ORGANIZATION_RESULT,
        }),
      deleteOrganization: (params) =>
        this.call({
          pathname: `/v1/organization/delete/${params.id}`,
          method: 'POST',
          resultType: organizations.DELETE_ORGANIZATION_RESULT,
        }),
      mergeOrganizations: (params) =>
        this.call({
          pathname: `/v1/organization/merge/${params.fromOrganizationIds.organizationId}`,
          method: 'PUT',
          body: {
            type: 'json',
            data: params,
          },
          resultType: organizations.ORGANIZATION,
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
  get plans(): plans.Model {
    return {
      getAutocompletePlans: (params) =>
        this.call({
          pathname: `/v1/object/autocomplete/plan/${params.query}`,
          resultType: plans.GET_PLANS_AUTOCOMPLETE_RESULT,
        }),
      getPlan: (params) =>
        this.call({
          pathname: `v2/plan/${params.id}`,
          resultType: plans.PLAN,
        }),
    };
  }
  get projects(): projects.Model {
    return {
      getAutocompleteProjects: (params) =>
        this.call({
          pathname: `/v1/object/autocomplete/project/${params.query}`,
          resultType: projects.GET_PROJECTS_AUTOCOMPLETE_RESULT,
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
        (typeof LIVE_TYPES)['REPORTING_WINDOWS']['GET_ASSIGNMENT_RESULT']
      >
    ): Promise<reportingWindows.GetAssignmentResult> => {
      // Only keep files that are used by this version of the assignment
      keepOnlyGivenFiles(result.task.currentFiles.map((f) => f.data.fileHash));

      // Download / prepare any necessary files
      const currentFiles: reportingWindows.GetAssignmentResult['task']['currentFiles'] =
        await Promise.all(
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

        if (reportingWindows.UPDATE_ASSIGNMENT_PARAMS_STATE_CHANGE.is(params)) {
          const [type, finalized] = params.state.split(':');

          const result = await this.call({
            method: 'PUT',
            body: {
              type: 'json',
              data: {
                state: {
                  type,
                  finalized: finalized === 'finalized',
                },
              },
            },
            pathname: `/v2/reportingwindows/assignments/${aId}`,
            resultType: LIVE_TYPES.REPORTING_WINDOWS.GET_ASSIGNMENT_RESULT,
          });
          return handleAssignmentResult(result);
        } else {
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
        }
      },
    };
  }
  get usageYears(): usageYears.Model {
    return {
      getUsageYears: () =>
        this.call({
          pathname: '/v1/fts/usage-year',
          resultType: usageYears.GET_USAGE_YEARS_RESULT,
        }),
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
      await this.call({
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
