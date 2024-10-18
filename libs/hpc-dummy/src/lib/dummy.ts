import { PathReporter } from 'io-ts/lib/PathReporter';
import { Session } from '@unocha/hpc-core';
import {
  Model,
  access,
  operations,
  reportingWindows,
  errors,
  organizations,
  locations,
  categories,
  emergencies,
  plans,
  projects,
  globalClusters,
  usageYears,
  flows,
  currencies,
  fileAssetEntities,
  governingEntities,
} from '@unocha/hpc-data';
import isEqual from 'lodash/isEqual';

import { Assignment, DummyData, DUMMY_DATA, User } from './data-types';
import { INITIAL_DATA } from './data';
import { Users } from './users';

const uriToBlob = (uri: string) => fetch(uri).then((res) => res.blob());

const uriToArrayBuffer = (uri: string) =>
  uriToBlob(uri).then((blob) => blob.arrayBuffer());

const blobToBase64URI = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('Unexpected error when converting blob to base64 dataUrl');
      }
    };
  });

const STORAGE_KEY = 'hpc-dummy';

/**
 * Create a dummy endpoint that simulates a bit of a delay,
 * and logs the call to the console.
 */
function dummyEndpoint<Data>(
  name: string,
  fn: () => Promise<Data>
): () => Promise<Data>;
function dummyEndpoint<Args extends [unknown, ...unknown[]], Data>(
  name: string,
  fn: (...data: Args) => Promise<Data>
): (...args: Args) => Promise<Data>;
function dummyEndpoint<Args extends [unknown, ...unknown[]], Data>(
  name: string,
  fn: (...data: Args) => Promise<Data>
): (...args: Args) => Promise<Data> {
  return (...args: Args) =>
    new Promise<Data>((resolve) => {
      console.log('[DUMMY] Endpoint Called: ', name, ...args);
      // TODO: allow triggering dummy endpoint failures for testing
      setTimeout(
        () =>
          resolve(
            fn(...args).then((data) => {
              console.log('[DUMMY] Endpoint Resolving: ', name, ...args, data);
              return data;
            })
          ),
        300
      );
    });
}

export { DummyData };

export class Dummy {
  private data: DummyData;
  private readonly users: Users;

  constructor() {
    this.data = INITIAL_DATA;
    this.users = new Users();
    this.users.attach();

    window.addEventListener('storage', this.load);
    this.load();

    this.users.addListener({
      loginAsUser: (user) => {
        this.data.currentUser = user.id;
        this.store();
        window.location.reload();
      },
    });
  }

  private load = () => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      try {
        this.data = JSON.parse(s);
        if (!DUMMY_DATA.is(this.data)) {
          // Print discrepancy in console
          console.error(PathReporter.report(DUMMY_DATA.decode(this.data)));
          if (
            window.confirm(
              `The stored dummy data doesn't match the current type definitions, ` +
                `do you want to reset it to the default?`
            )
          ) {
            this.data = INITIAL_DATA;
            this.store();
          }
        } else {
          this.users.setUsers(this.data.users);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      this.users.setUsers(this.data.users);
      this.data = INITIAL_DATA;
      this.store();
    }
  };

  private store = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.users.setUsers(this.data.users);
  };

  public getSession = (): Session => {
    return {
      getUser: () => {
        const u = this.data.users.filter((u) => u.id === this.data.currentUser);
        return u.length === 1 ? u[0].user : null;
      },
      logIn: () => {
        this.users.login();
      },
      logOut: () => {
        this.data.currentUser = null;
        this.store();
        window.location.reload();
      },
    };
  };

  private getFormMeta(formId: number) {
    const forms = this.data.forms.filter((f) => f.id === formId);
    if (forms.length === 1) {
      return forms[0];
    } else {
      throw new Error('Unexpected result when getting forms for ID:' + formId);
    }
  }

  private async getAssignmentResult(
    assignmentId: number
  ): Promise<reportingWindows.GetAssignmentResult> {
    let assignment: Assignment | null = null;
    for (const window of this.data.reportingWindows) {
      for (const a of window.assignments) {
        if (a.id === assignmentId) {
          assignment = a;
        }
      }
    }
    if (!assignment) {
      throw new errors.NotFoundError();
    }

    const getAssignmentTask = async (a: Assignment) => {
      if (a.type === 'form') {
        const form = this.data.forms.filter((f) => f.id === a.formId);
        if (form.length === 0) {
          throw new Error('missing form');
        }
        const r: reportingWindows.GetAssignmentResult['task'] = {
          type: 'form' as const,
          form: form[0],
          currentData: a.currentData,
          currentFiles: await Promise.all(
            a.currentFiles.map(async (f) => ({
              name: f.name,
              data: await uriToArrayBuffer(f.base64Data),
            }))
          ),
        };
        return r;
      } else {
        throw new Error('Unknown type');
      }
    };

    let assignee: reportingWindows.GetAssignmentResult['assignee'];
    if (assignment.assignee.type === 'operationCluster') {
      const clusterId = assignment.assignee.clusterId;
      const cluster = this.data.operationClusters.filter(
        (c) => c.id === clusterId
      );
      assignee = {
        type: 'operationCluster',
        clusterId,
        clusterName: cluster[0]?.name,
      };
    } else {
      assignee = assignment.assignee;
    }

    const r: reportingWindows.GetAssignmentResult = {
      id: assignment.id,
      version: assignment.version,
      lastUpdatedAt: assignment.lastUpdatedAt,
      lastUpdatedBy: assignment.lastUpdatedBy,
      state: assignment.state,
      editable:
        assignment.state in ['not-entered', 'raw:entered']
          ? true
          : this.userHasAccess([
              {
                target: { type: 'global' },
                role: 'hpc_admin',
              },
            ]),
      task: await getAssignmentTask(assignment),
      assignee,
      assignedUsers: [{ name: 'Assignee Name', email: 'test@email.com' }],
    };
    return r;
  }

  public userHasAccess = (
    options: Array<{
      target: access.AccessTarget;
      role: string;
    }>
  ): boolean => {
    if (this.data.currentUser === null) {
      return false;
    }

    const userAccess = this.data.access.active.filter(
      (a) => a.grantee.type === 'user' && a.grantee.id === this.data.currentUser
    );

    for (const a of userAccess) {
      for (const option of options) {
        if (
          isEqual(a.target, option.target) &&
          a.roles.indexOf(option.role) > -1
        ) {
          return true;
        }
      }
    }

    return false;
  };

  public getAccessForTarget = (
    target: access.AccessTarget
  ): access.GetTargetAccessResult => {
    let { active, invites, auditLog } = this.data.access;

    active = active.filter(
      (i) => isEqual(i.target, target) && i.roles.length > 0
    );
    invites = invites.filter(
      (i) => isEqual(i.target, target) && i.roles.length > 0
    );
    auditLog = auditLog.filter((i) => isEqual(i.target, target));

    const getFullGrantee = (g: access.Grantee): access.GranteeWithMeta => {
      if (g.type === 'user') {
        const u = this.data.users.filter((u) => u.id === g.id)[0];
        if (!u) {
          throw new Error('Unknown User');
        }
        return {
          ...g,
          name: u.user.name,
          email: u.email,
        };
      } else {
        throw new Error('Unexpected access grantee type');
      }
    };

    const getAllowedRoles = (target: access.AccessTarget) => {
      if (target.type === 'global') {
        return ['hpc_admin', 'swaps'];
      } else if (target.type === 'operation') {
        return ['operationLead', 'testRole1', 'testRole2'];
      } else if (target.type === 'operationCluster') {
        return ['clusterLead'];
      } else {
        throw new Error('Unexpected access target type');
      }
    };

    return {
      roles: getAllowedRoles(target),
      active: active.map((i) => ({
        roles: i.roles,
        grantee: getFullGrantee(i.grantee),
      })),
      invites: invites.map((i) => ({
        email: i.email,
        lastModifiedBy: getFullGrantee({
          type: 'user',
          id: i.lastModifiedBy,
        }),
        roles: i.roles,
      })),
      auditLog: auditLog
        .map((i) => ({
          roles: i.roles,
          actor: getFullGrantee({
            type: 'user',
            id: i.actor,
          }),
          grantee: getFullGrantee(i.grantee),
          date: i.date,
        }))
        .sort((a, b) => b.date - a.date),
    };
  };

  public getModel = (): Model => {
    return {
      access: {
        getOwnAccess: dummyEndpoint(
          'access.getOwnAccess',
          async (): Promise<access.GetOwnAccessResult> => {
            const roles =
              this.data.access.active.find(
                (a) =>
                  a.grantee.id === this.data.currentUser &&
                  a.target.type === 'global'
              )?.roles || false;
            console.log(roles);
            return {
              permissions: {
                canModifyGlobalUserAccess: roles && roles.includes('hpc_admin'),
              },
            };
          }
        ),
        getTargetAccess: dummyEndpoint(
          'access.getTargetAccess',
          async ({ target }: access.GetTargetAccessParams) => {
            return this.getAccessForTarget(target);
          }
        ),
        updateTargetAccess: dummyEndpoint(
          'access.updateTargetAccess',
          async ({
            target,
            grantee,
            roles,
          }: access.UpdateTargetAccessParams) => {
            if (this.data.currentUser === null) {
              throw new Error('not logged in');
            }
            const existing = this.data.access.active.filter(
              (i) =>
                isEqual(i.target, target) &&
                i.grantee.type === grantee.type &&
                i.grantee.id === grantee.id
            );
            if (existing.length === 1) {
              existing[0].roles = roles;
            } else {
              this.data.access.active.push({ target, grantee, roles });
            }
            this.data.access.auditLog.push({
              target,
              grantee,
              roles,
              date: Date.now(),
              actor: this.data.currentUser,
            });
            this.store();
            return this.getAccessForTarget(target);
          }
        ),
        updateTargetAccessInvite: dummyEndpoint(
          'access.updateTargetAccessInvite',
          async ({
            target,
            email,
            roles,
          }: access.UpdateTargetAccessInviteParams) => {
            if (this.data.currentUser === null) {
              throw new Error('not logged in');
            }
            const existing = this.data.access.invites.filter(
              (i) => isEqual(i.target, target) && i.email === email
            );
            if (existing.length === 1) {
              existing[0].roles = roles;
              existing[0].lastModifiedBy = this.data.currentUser;
            } else {
              this.data.access.invites.push({
                target,
                email,
                roles,
                lastModifiedBy: this.data.currentUser,
              });
            }
            this.store();
            return this.getAccessForTarget(target);
          }
        ),
        addTargetAccess: dummyEndpoint(
          'access.addTargetAccess',
          async ({ target, email, roles }: access.AddTargetAccessParams) => {
            if (this.data.currentUser === null) {
              throw new Error('not logged in');
            }
            const existingInvite = this.data.access.invites.filter(
              (i) => isEqual(i.target, target) && i.email === email
            );
            if (existingInvite.length > 0) {
              throw new errors.UserError('access.userAlreadyInvited');
            }
            const existingUser = this.data.users.filter(
              (u) => u.email === email
            )[0] as User | undefined;
            const existingUserAccess = this.data.access.active.filter(
              (i) =>
                isEqual(i.target, target) &&
                i.grantee.type === 'user' &&
                i.grantee.id === existingUser?.id
            );
            if (existingUserAccess.length > 0) {
              if (existingUserAccess[0].roles.length > 0) {
                throw new errors.UserError('access.userAlreadyAdded');
              } else {
                existingUserAccess[0].roles = roles;
                this.data.access.auditLog.push({
                  target,
                  grantee: existingUserAccess[0].grantee,
                  roles,
                  date: Date.now(),
                  actor: this.data.currentUser,
                });
              }
            } else {
              // Not added yet, add user
              if (existingUser) {
                const grantee = {
                  type: 'user',
                  id: existingUser.id,
                } as const;
                this.data.access.active.push({
                  target,
                  grantee,
                  roles,
                });
                this.data.access.auditLog.push({
                  target,
                  grantee,
                  roles,
                  date: Date.now(),
                  actor: this.data.currentUser,
                });
              } else {
                this.data.access.invites.push({
                  target,
                  email,
                  roles,
                  lastModifiedBy: this.data.currentUser,
                });
              }
            }
            this.store();
            return this.getAccessForTarget(target);
          }
        ),
      },

      categories: {
        getCategories: dummyEndpoint(
          'categories.getCategories',
          async ({
            query,
          }: categories.GetCategoriesParams): Promise<categories.GetCategoriesResult> => {
            return this.data.categories.filter(
              (category) => category.group === query
            );
          }
        ),
        getKeywords: dummyEndpoint(
          'categories.getKeywords',
          async (): Promise<categories.GetKeywordsResult> => {
            return this.data.keywords;
          }
        ),
        deleteKeyword: dummyEndpoint(
          'categories.deleteKeyword',
          async ({
            id,
          }: categories.DeleteKeywordParams): Promise<categories.DeleteKeywordResult> => {
            //  TODO: Properly implement, on reload dummy data resets
            this.data.keywords = this.data.keywords.filter(
              (keyword) => keyword.id !== id
            );
            return undefined;
          }
        ),
        updateKeyword: dummyEndpoint(
          'categories.updateKeyword',
          async (params: categories.Keyword): Promise<categories.Category> => {
            this.data.keywords = this.data.keywords.map((keyword) => {
              if (keyword.id === params.id) {
                return params;
              }
              return keyword;
            });
            return params;
          }
        ),
        mergeKeywords: dummyEndpoint(
          'categories.mergeKeywords',
          async (): Promise<categories.MergeKeywordResult> => {
            /**
             * TODO: Implement mocked logic for mergeKeywords
             */

            return undefined;
          }
        ),
      },
      currencies: {
        getCurrencies: dummyEndpoint(
          'currencies.getCurrencies',
          async (): Promise<currencies.GetCurrenciesResult> => {
            return this.data.currencies;
          }
        ),
      },
      emergencies: {
        getAutocompleteEmergencies: dummyEndpoint(
          'emergencies.getAutocompleteEmergencies',
          async ({
            query,
          }: emergencies.GetEmergenciesAutocompleteParams): Promise<emergencies.GetEmergenciesAutocompleteResult> => {
            return this.data.emergencies.filter((emergency) =>
              emergency.name.toUpperCase().includes(query.toUpperCase())
            );
          }
        ),
      },
      fileAssetEntities: {
        fileUpload: dummyEndpoint(
          'fileAssetEntities.fileUpload',
          async (
            file: FormData
          ): Promise<fileAssetEntities.FileUploadResult> => {
            //  TODO: Properly add mocked data
            return {
              collection: 'fts',
              createdAt: new Date().toISOString(),
              name: 'test.pdf',
              id: Date.now(),
              mimetype: 'application/pdf',
              originalname: 'test.pdf',
              file: 'test.pdf',
              size: 12302,
              updatedAt: new Date().toISOString(),
              self: 'https://test.com',
            };
          }
        ),
        fileDelete: dummyEndpoint('fileAssetEntities.fileDelete', async () => {
          throw new errors.NotFoundError();
        }),
        fileDownload: dummyEndpoint(
          'fileAssetEntities.fileDownload',
          async () => {
            throw new errors.NotFoundError();
          }
        ),
      },
      flows: {
        getFlowREST: dummyEndpoint('flows.getFlowREST', async () => {
          throw new errors.NotFoundError();
        }),
        getFlowVersionREST: dummyEndpoint(
          'flows.getFlowVersionREST',
          async () => {
            throw new errors.NotFoundError();
          }
        ),
        getFlow: dummyEndpoint('flows.getFlow', async () => {
          throw new errors.NotFoundError();
        }),
        getAutocompleteFlows: dummyEndpoint(
          'flows.getAutocompleteFlows',
          async (params: flows.GetFlowsAutocompleteParams) => {
            return this.data.flows.filter((flow) => {
              return (
                flow.description
                  ?.toLowerCase()
                  .includes(params.query.toLowerCase()) ||
                flow.id.toString().includes(params.query)
              );
            }) as any; //  TODO: Remove any
          }
        ),
        searchFlows: dummyEndpoint(
          'flows.searchFlows',
          async (params: flows.SearchFlowsParams) => {
            /**
             * TODO: Implement mocked logic for filters
             */

            let flows = this.data.flows.filter(
              (flow) => !flow.categories?.some((category) => category.id === 45)
            );
            /** pending filter */
            if (params.pending) {
              flows = this.data.flows.filter(
                (flow) =>
                  flow.categories?.some((category) => category.id === 45)
              );
            }
            const searchFlows = {
              total: flows.length,
              flows: flows,
              prevPageCursor: 0,
              nextPageCursor: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              pageSize: 10,
            };
            return { searchFlows };
          }
        ),
        bulkRejectPendingFlows: dummyEndpoint(
          'flows.bulkRejectPendingFlows',
          async ({ flows }: flows.BulkRejectPendingFlowsParams) => {
            const ids = flows.map((flow) => flow.id);
            const versionIds = flows.map((flow) => flow.versionID);

            this.data.flows = this.data.flows.map((flow) => {
              if (
                ids.includes(flow.id) &&
                versionIds.includes(flow.versionID)
              ) {
                return {
                  ...flow,
                  categories: [
                    // We remove 'Pending review' category (id: 45)
                    ...(flow.categories?.filter(
                      (category) => category.id !== 45
                    ) ?? []),

                    // We add 'Rejected' category (id: 87)
                    {
                      id: 87,
                      name: 'Rejected',
                      parentID: null,
                      group: 'inactiveReason',
                      createdAt: '2017-01-13T14:20:34.337Z',
                      updatedAt: '2017-01-13T14:20:34.337Z',
                      code: null,
                      includeTotals: null,
                      categoryRef: {
                        objectID: flow.id,
                        versionID: flow.versionID,
                        objectType: 'flow',
                        categoryID: 87,
                        updatedAt: new Date().toISOString(),
                      },
                    },
                  ],
                };
              }
              return flow;
            });
            return flows;
          }
        ),
        getFlowsDownloadXLSX: dummyEndpoint(
          'flows.getFlowsDownloadXLSX',
          async () => {
            throw new errors.NotFoundError();
          }
        ),
        createFlow: dummyEndpoint(
          'flow.createFlow',
          async (params: flows.CreateFlowParams) => {
            const id = Date.now();
            const {
              activeStatus,
              amountUSD,
              decisionDate,
              exchangeRate,
              flowDate,
              newMoney,
              restricted,
            } = params.flow;

            // TODO: Properly mock data
            const flow = {
              id,
              versionID: 1,
              activeStatus,
              amountUSD: amountUSD.toString(),
              decisionDate,
              exchangeRate: exchangeRate ? exchangeRate.toString() : null,
              updatedAt: new Date().toISOString(),
              flowDate,
              newMoney,
              restricted,
              externalReferences: [],
              parkedParentSource: { organization: [], orgName: [] },
              reportDetails: [],
            } as const;

            this.data.flows.push(flow as unknown as flows.Flow);

            const participant = { name: 'Me' };
            const res: flows.GetFlowResult = {
              ...flow,
              firstReportedDate: '',
              versionStartDate: '',
              createdAt: '',
              createdBy: participant,
              description: '',
              lastUpdatedBy: participant,
              notes: '',
              categories: [],
              plans: [],
              planEntities: [],
              organizations: [],
              locations: [],
              globalClusters: [],
              usageYears: [],
              projects: [],
              emergencies: [],
              governingEntities: [],
              clusters: [],
              children: [],
              parents: [],
              reportDetails: [],
              versions: [],
            };
            return res;
          }
        ),
        updateFlow: dummyEndpoint(
          'flows.updateFlow',
          async (
            params: flows.UpdateFlowParams
          ): Promise<flows.GetFlowResult> => {
            const {
              id,
              versionID,
              activeStatus,
              amountUSD,
              decisionDate,
              exchangeRate,
              flowDate,
              newMoney,
              restricted,
            } = params.flow;
            const flow = {
              id,
              versionID,
              activeStatus,
              amountUSD: amountUSD.toString(),
              decisionDate,
              exchangeRate: exchangeRate ? exchangeRate.toString() : null,
              updatedAt: new Date().toISOString(),
              flowDate,
              newMoney,
              restricted,
              externalReferences: [],
              parkedParentSource: { organization: [], orgName: [] },
              reportDetails: [],
            } as const;
            const participant = { name: 'Me' };
            const res: flows.GetFlowResult = {
              ...flow,
              firstReportedDate: '',
              versionStartDate: '',
              createdAt: '',
              createdBy: participant,
              description: '',
              lastUpdatedBy: participant,
              notes: '',
              categories: [],
              plans: [],
              planEntities: [],
              organizations: [],
              locations: [],
              globalClusters: [],
              usageYears: [],
              projects: [],
              emergencies: [],
              governingEntities: [],
              clusters: [],
              children: [],
              parents: [],
              reportDetails: [],
              versions: [],
            };
            return res;
          }
        ),
      },
      globalClusters: {
        getGlobalClusters: dummyEndpoint(
          'globalClusters.getGlobalClusters',
          async (): Promise<globalClusters.GetGlobalClustersResult> => {
            return this.data.globalClusters;
          }
        ),
      },
      governingEntities: {
        getGoverningEntity: dummyEndpoint(
          'governingEntities.getGoverningEntity',
          async ({
            id,
          }: governingEntities.GetGoverningEntityParams): Promise<governingEntities.GetGoverningEntityResult> => {
            // TODO: Fix dummy endpoint

            const gE = this.data.governingEntities.find((gE) => gE.id === id);
            if (!gE) {
              throw new errors.NotFoundError();
            }
            return {
              ...gE,
              governingEntityVersion: {
                id: 1,
                governingEntityId: 1,
                name: 'name',
                customReference: '',
              },
              globalClusters: [],
            } satisfies governingEntities.GetGoverningEntityResult;
          }
        ),
        getGoverningEntitiesByPlanId: dummyEndpoint(
          'governingEntities.getGoverningEntitiesByPlanId',
          async ({
            planId,
            excludeAttachments,
          }: governingEntities.GetGoverningEntitiesByPlanIdParams): Promise<governingEntities.GetGoverningEntitiesByPlanIdResult> => {
            // TODO: Fix dummy endpoint
            const gEs = this.data.governingEntities
              .filter((gE) => gE.planId === planId)
              .map((gE) => ({
                ...gE,
                governingEntityVersion: {
                  id: 1,
                  governingEntityId: 1,
                  name: 'name',
                  customReference: '',
                },
                globalClusterIds: [],
              }));
            return gEs;
          }
        ),
      },
      locations: {
        getAutocompleteLocations: dummyEndpoint(
          'locations.getAutocompleteLocations',
          async ({
            query,
          }: locations.GetLocationsAutocompleteParams): Promise<locations.GetLocationsAutocompleteResult> => {
            return this.data.locations.filter((location) =>
              location.name.toUpperCase().includes(query.toUpperCase())
            );
          }
        ),
      },
      organizations: {
        getAutocompleteOrganizations: dummyEndpoint(
          'organizations.getAutocompleteOrganizations',
          async ({
            query,
          }: organizations.GetOrganizationsAutocompleteParams): Promise<organizations.GetOrganizationsResult> => {
            return this.data.organizations.filter((organization) =>
              organization.name.toUpperCase().includes(query.toUpperCase())
            );
          }
        ),
        searchOrganizations: dummyEndpoint(
          'organizations.searchOrganizations',
          async (): Promise<organizations.SearchOrganizationResult> => {
            const parsedOrganizations = this.data.organizations.map(
              (organization) => {
                const {
                  id,
                  name,
                  nativeName,
                  abbreviation,
                  active,
                  categories,
                  locations,
                } = organization;
                return {
                  id,
                  name,
                  nativeName,
                  abbreviation,
                  active,
                  categories:
                    categories?.map((category) => {
                      const { name: categoryName, group, parentID } = category;
                      return { name: categoryName, group, parentID };
                    }) ?? [],
                  locations:
                    locations?.map((location) => {
                      const {
                        id: locationID,
                        name: locationName,
                        parentId: parentID,
                      } = location;
                      return { id: locationID, name: locationName, parentID };
                    }) ?? [],
                  create: [],
                  update: [],
                };
              }
            );

            return {
              count: this.data.organizations.length.toString(),
              organizations: parsedOrganizations,
            };
          }
        ),
        getOrganization: dummyEndpoint(
          'organizations.getOrganization',
          async ({
            id,
          }: organizations.GetOrganizationParams): Promise<organizations.GetOrganizationResult> => {
            const organization = this.data.organizations.find(
              (organization) => organization.id === id
            );
            if (!organization) {
              throw new errors.NotFoundError();
            }
            return organization;
          }
        ),
        createOrganization: dummyEndpoint(
          'organizations.createOrganization',
          async ({
            organization,
          }: organizations.CreateOrganizationParams): Promise<organizations.CreateOrganizationResult> => {
            const id = Date.now();
            const date = new Date().toISOString();
            const organizationWithID: organizations.Organization = {
              ...organization,
              id,
              nativeName: organization.nativeName ?? null,
              url: organization.url ?? null,
              parentID: organization.parentID ?? null,
              comments: organization.comments ?? null,
              verified: organization.verified ?? false,
              notes: organization.notes ?? null,
              locations: this.data.locations.filter(
                (location) => organization.locations?.includes(location.id)
              ),
              categories: this.data.categories
                .filter(
                  (category) => organization.categories?.includes(category.id)
                )
                .map((category) => ({
                  ...category,
                  categoryRef: {
                    objectID: id,
                    versionID: 1,
                    objectType: 'organization',
                    categoryID: category.id,
                    createdAt: date,
                    updatedAt: date,
                  },
                })),
              createdAt: date,
              updatedAt: date,
              deletedAt: null,
              active: true,
              collectiveInd: false,
              newOrganizationId: null,
            };
            this.data.organizations.push(organizationWithID);
            return { ...organizationWithID, meta: { language: 'en' } };
          }
        ),
        updateOrganization: dummyEndpoint(
          'organizations.updateOrganization',
          async (
            organization: organizations.UpdateOrganizationParams
          ): Promise<organizations.UpdateOrganizationResult> => {
            const date = new Date().toISOString();
            const organizationIndex = this.data.organizations.findIndex(
              (dataOrganization) => dataOrganization.id === organization.id
            );
            const dataOrganization = this.data.organizations[organizationIndex];
            if (organizationIndex === -1 || !dataOrganization) {
              throw new errors.NotFoundError();
            }

            const parsedOrganization: organizations.Organization = {
              ...organization,
              abbreviation:
                organization.abbreviation ?? dataOrganization.abbreviation,
              active: organization.active ?? dataOrganization.active,
              collectiveInd:
                organization.collectiveInd ?? dataOrganization.collectiveInd,
              comments: organization.comments ?? null,
              deletedAt: organization.deletedAt ?? null,
              name: organization.name ?? dataOrganization.name,
              nativeName: organization.nativeName ?? null,
              newOrganizationId: organization.newOrganizationId ?? null,
              notes: organization.notes ?? null,
              parentID: organization.parentID ?? null,
              url: organization.url ?? null,
              verified: organization.verified ?? dataOrganization.verified,
              parent:
                this.data.organizations.find(
                  (org) => org.id === organization.parentID
                ) ?? null,
              locations: this.data.locations.filter(
                (location) => organization.locations?.includes(location.id)
              ),
              categories: this.data.categories
                .filter(
                  (category) => organization.categories?.includes(category.id)
                )
                .map((category) => ({
                  ...category,
                  categoryRef: {
                    objectID: organization.id,
                    versionID: 1,
                    objectType: 'organization',
                    categoryID: category.id,
                    createdAt: date,
                    updatedAt: date,
                  },
                })),
              createdAt: organization.createdAt ?? dataOrganization.createdAt,
              updatedAt: date,
            };
            this.data.organizations[organizationIndex] = parsedOrganization;
            const user = this.data.users.find(
              (u) => u.id === this.data.currentUser
            )?.user.name;
            return {
              ...parsedOrganization,
              participantLog: [
                {
                  participant: user ? { name: user } : null,
                  createdAt: date,
                  editType: 'update',
                },
              ],
            };
          }
        ),
        deleteOrganization: dummyEndpoint(
          'organizations.deleteOrganization',
          async ({
            id,
          }: organizations.DeleteOrganizationParams): Promise<organizations.DeleteOrganizationResult> => {
            const index = this.data.organizations.findIndex(
              (organization) => organization.id === id
            );
            if (index === -1) {
              throw new errors.NotFoundError();
            }
            //  Remove organization
            this.data.organizations.splice(index, 1);
            return undefined;
          }
        ),
        mergeOrganizations: dummyEndpoint(
          'organizations.mergeOrganization',
          async (): Promise<organizations.MergeOrganizationsResult> => {
            /**
             * TODO: Implement logic for mergeOrganizations
             */

            return {
              id: 9093,
              name: 'Association pour le Secours et le Développement',
              nativeName: '',
              abbreviation: 'ASD',
              url: null,
              parentID: null,
              comments:
                'Développement coordonne ses programmes autour de 6 domaines d’activités : • Nutrition, santé, pratiques de soins • Sécurité alimentaire et moyens d’existence • Eau, assainissement et hygiène • Plaidoyer et sensibilisation • Abris • Education',
              verified: true,
              notes: null,
              active: true,
              collectiveInd: false,
              newOrganizationId: null,
              createdAt: '2017-10-29T20:45:26.233Z',
              updatedAt: '2019-05-14T12:19:16.995Z',
              deletedAt: null,
            };
          }
        ),
      },
      operations: {
        getOperations: dummyEndpoint('operations.getOperations', async () => ({
          data: this.data.operations,
          permissions: {
            canAddOperation: true,
          },
        })),
        getOperation: dummyEndpoint(
          'operations.getOperation',
          async ({ id }: operations.GetOperationParams) => {
            const op = this.data.operations.filter((op) => op.id === id);
            if (op.length === 1) {
              const r: operations.GetOperationResult = {
                data: {
                  ...op[0],
                  reportingWindows: this.data.reportingWindows.filter(
                    (w) => w.associations.operations.indexOf(id) > -1
                  ),
                  permissions: {
                    canModifyAccess: this.userHasAccess([
                      {
                        target: { type: 'global' },
                        role: 'hpc_admin',
                      },
                    ]),
                    canModifyClusterAccessAndPermissions: this.userHasAccess([
                      {
                        target: { type: 'global' },
                        role: 'hpc_admin',
                      },
                      {
                        target: {
                          type: 'operation',
                          targetId: id,
                        },
                        role: 'operationLead',
                      },
                    ]),
                  },
                },
              };
              return r;
            }
            throw new errors.NotFoundError();
          }
        ),
        getClusters: dummyEndpoint(
          'operations.getClusters',
          async ({ operationId }: operations.GetClustersParams) => {
            const op = this.data.operations.filter(
              (op) => op.id === operationId
            );
            if (op.length !== 1) {
              throw new errors.NotFoundError();
            }
            const r: operations.GetClustersResult = {
              data: this.data.operationClusters
                .filter((cl) => cl.operationId === operationId)
                .map((cluster) => ({
                  ...cluster,
                  permissions: {
                    canModifyAccess: this.userHasAccess([
                      {
                        target: { type: 'global' },
                        role: 'hpc_admin',
                      },
                      {
                        target: {
                          type: 'operation',
                          targetId: cluster.operationId,
                        },
                        role: 'operationLead',
                      },
                    ]),
                  },
                })),
            };
            return r;
          }
        ),
      },
      plans: {
        getAutocompletePlans: dummyEndpoint(
          'plans.getAutocompletePlans',
          async ({
            query,
          }: plans.GetPlansAutocompleteParams): Promise<plans.GetPlansAutocompleteResult> => {
            return this.data.plans.filter((plan) =>
              plan.name.toUpperCase().includes(query.toUpperCase())
            );
          }
        ),
        getPlan: dummyEndpoint(
          'plans.getPlan',
          async <T extends plans.GetPlanScope[]>({
            id,
            scopes,
          }: plans.GetPlanParams<T>): Promise<plans.GetPlanResult<T>> => {
            const plan = this.data.plans.find((plan) => plan.id === id);
            if (!plan) {
              throw new errors.NotFoundError();
            }
            //  TODO: Fix dummy endpoint
            return plan as any;
          }
        ),
      },
      projects: {
        getAutocompleteProjects: dummyEndpoint(
          'projects.getAutocompleteProjects',
          async ({
            query,
          }: projects.GetProjectsAutocompleteParams): Promise<projects.GetProjectsAutocompleteResult> => {
            return this.data.projects.filter((project) =>
              project.name.toUpperCase().includes(query.toUpperCase())
            );
          }
        ),
        getProject: dummyEndpoint(
          'projects.getProject',
          async ({
            id,
          }: projects.GetProjectParams): Promise<projects.GetProjectResult> => {
            throw new errors.NotFoundError();
          }
        ),
      },
      reportingWindows: {
        getAssignmentsForOperation: dummyEndpoint(
          'reportingWindows.getAssignmentsForOperation',
          async (params: reportingWindows.GetAssignmentsForOperationParams) => {
            const { operationId, reportingWindowId } = params;
            const window = this.data.reportingWindows.filter(
              (w) => w.id === reportingWindowId
            );
            if (window.length === 0) {
              throw new errors.NotFoundError();
            }
            const r: reportingWindows.GetAssignmentsForOperationResult = {
              directAssignments: {
                forms: window[0].assignments
                  .filter(
                    (a) =>
                      a.type === 'form' &&
                      a.assignee.type === 'operation' &&
                      a.assignee.operationId === operationId
                  )
                  .map((a) => ({
                    assignmentId: a.id,
                    state: a.state,
                    lastUpdatedAt: a.lastUpdatedAt,
                    lastUpdatedBy: a.lastUpdatedBy,
                    form: this.getFormMeta(a.formId),
                  })),
              },
              clusterAssignments: this.data.operationClusters
                .filter((cl) => cl.operationId === operationId)
                .map((cluster) => ({
                  clusterId: cluster.id,
                  cl: cluster,
                  forms: window[0].assignments
                    .filter(
                      (a) =>
                        a.type === 'form' &&
                        a.assignee.type === 'operationCluster' &&
                        a.assignee.clusterId === cluster.id
                    )
                    .map((a) => ({
                      assignmentId: a.id,
                      state: a.state,
                      lastUpdatedAt: a.lastUpdatedAt,
                      lastUpdatedBy: a.lastUpdatedBy,
                      form: this.getFormMeta(a.formId),
                    })),
                })),
            };
            return r;
          }
        ),
        getAssignment: dummyEndpoint(
          'reportingWindows.getAssignment',
          async (
            params: reportingWindows.GetAssignmentParams
          ): Promise<reportingWindows.GetAssignmentResult> => {
            const { assignmentId } = params;
            return this.getAssignmentResult(assignmentId);
          }
        ),
        updateAssignment: dummyEndpoint(
          'reportingWindows.updateAssignment',
          async (
            params: reportingWindows.UpdateAssignmentParams
          ): Promise<reportingWindows.GetAssignmentResult> => {
            if (
              reportingWindows.UPDATE_ASSIGNMENT_PARAMS_STATE_CHANGE.is(params)
            ) {
              const [assignment] = this.data.reportingWindows
                .map((rw) =>
                  rw.assignments.find((a) => a.id === params.assignmentId)
                )
                .filter((a) => a);

              if (assignment) {
                assignment.state = params.state;
              }
              this.store();
              return this.getAssignmentResult(params.assignmentId);
            }
            const {
              assignmentId,
              form: { id, data, files, finalized },
              previousVersion,
            } = params;

            for (const rw of this.data.reportingWindows) {
              for (const a of rw.assignments) {
                if (a.id === assignmentId && a.formId === id) {
                  if (a.version !== previousVersion) {
                    throw new errors.ConflictError(
                      new Date(a.lastUpdatedAt),
                      a.lastUpdatedBy
                    );
                  }
                  const u = this.data.users.filter(
                    (u) => u.id === this.data.currentUser
                  );
                  a.version++;
                  a.state = finalized ? 'raw:finalized' : 'raw:entered';
                  a.lastUpdatedAt = Date.now();
                  a.lastUpdatedBy = u[0]?.user.name || 'Unknown';
                  a.currentData = data;
                  a.currentFiles = await Promise.all(
                    files.map(async (f) => ({
                      name: f.name,
                      base64Data: await blobToBase64URI(new Blob([f.data])),
                    }))
                  );
                }
              }
            }

            this.store();
            return this.getAssignmentResult(assignmentId);
          }
        ),
      },
      systems: {
        getSystems: dummyEndpoint('external.systems', async () => [
          { systemID: 'EDRIS' },
          { systemID: 'IATI' },
          { systemID: 'CERF' },
          { systemID: 'OCT' },
        ]),
      },
      usageYears: {
        getUsageYears: dummyEndpoint(
          'usageYear.getUsageYears',
          async (): Promise<usageYears.GetUsageYearsResult> => {
            return this.data.usageYears;
          }
        ),
        getAutocompleteUsageYears: dummyEndpoint(
          'usageYear.getAutocompleteUsageYears',
          async (
            params: usageYears.GetUsageYearsAutocompleteParams
          ): Promise<usageYears.GetUsageYearsResult> => {
            return this.data.usageYears.filter((usageYear) =>
              usageYear.year.includes(params.query)
            );
          }
        ),
      },
    };
  };
}
