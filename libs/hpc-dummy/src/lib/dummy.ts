import { PathReporter } from 'io-ts/lib/PathReporter';
import { Session } from '@unocha/hpc-core';
import {
  Model,
  access,
  flows,
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
  currencies,
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

      /** TODO: Did not try to implement it propper data since I don't use it */
      categories: {
        getCategories: dummyEndpoint(
          'categories.getCategories',
          async (
            params: categories.GetCategoriesParams
          ): Promise<categories.GetCategoriesResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 1158,
                name: 'Asia 2002',
                description: null,
                parentID: null,
                code: null,
                group: 'keywords',
                includeTotals: null,
                createdAt: '2017-01-14T02:49:28.386Z',
                updatedAt: '2017-01-14T02:49:28.386Z',
              },
              {
                id: 137,
                name: 'Carryover',
                description: null,
                parentID: null,
                code: null,
                group: 'flowType',
                includeTotals: null,
                createdAt: '2017-01-13T22:18:02.844Z',
                updatedAt: '2017-01-13T22:18:02.844Z',
              },
              {
                id: 48,
                name: 'Paid',
                description: null,
                parentID: null,
                code: null,
                group: 'flowStatus',
                includeTotals: null,
                createdAt: '2017-01-13T14:20:32.042Z',
                updatedAt: '2017-01-13T14:20:32.042Z',
              },
            ];
          }
        ),
        getKeywords: dummyEndpoint(
          'categories.getKeywords',
          async (): Promise<categories.GetKeywordsResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 1158,
                name: 'Asia 2002',
                description: null,
                parentID: null,
                code: null,
                group: 'keywords',
                includeTotals: null,
                createdAt: '2017-01-14T02:49:28.386Z',
                updatedAt: '2017-01-14T02:49:28.386Z',
                refCount: '2',
              },
              {
                id: 137,
                name: 'Carryover',
                description: null,
                parentID: null,
                code: null,
                group: 'flowType',
                includeTotals: null,
                createdAt: '2017-01-13T22:18:02.844Z',
                updatedAt: '2017-01-13T22:18:02.844Z',
                refCount: '5',
              },
            ];
          }
        ),
        deleteKeyword: dummyEndpoint(
          'categories.deleteKeyword',
          async (
            params: categories.DeleteKeywordParams
          ): Promise<categories.DeleteKeywordResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return undefined;
          }
        ),
        updateKeyword: dummyEndpoint(
          'categories.updateKeyword',
          async (params: categories.Keyword): Promise<categories.Category> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return {
              id: 1158,
              name: 'Asia 2002',
              description: null,
              parentID: null,
              code: null,
              group: 'keywords',
              includeTotals: null,
              createdAt: '2017-01-14T02:49:28.386Z',
              updatedAt: '2017-01-14T02:49:28.386Z',
            };
          }
        ),
      },
      emergencies: {
        getAutocompleteEmergencies: dummyEndpoint(
          'emergencies.getAutocompleteEmergencies',
          async (
            params: emergencies.GetEmergenciesAutocompleteParams
          ): Promise<emergencies.GetEmergenciesAutocompleteResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 513,
                name: 'AFGHANISTAN - Floods - June 2010',
                description:
                  'The floods took place in the Northeastern Region of Afghanistan in June 2010. Nine (9) people died and more than 50 villages affected.',
                date: '2010-06-02T00:00:00.000Z',
                glideId: 'FL-2010-000127-AFG',
                levelThree: false,
                active: true,
                restricted: false,
                createdAt: '2017-01-14T00:52:09.851Z',
                updatedAt: '2017-01-14T00:52:09.851Z',
              },
              {
                id: 509,
                name: 'AFGHANISTAN - Floods and Avalanches - Feb 2010',
                description:
                  'At least 20 people have died in floods and avalanches, including flash floods, triggered by heaviest rain and snow in Afghanistan for 50 years.',
                date: '2010-02-02T00:00:00.000Z',
                glideId: 'FL-2010-000021-AFG',
                levelThree: false,
                active: true,
                restricted: false,
                createdAt: '2017-01-14T00:52:09.833Z',
                updatedAt: '2017-01-14T00:52:09.833Z',
              },
              {
                id: 409,
                name: 'AFGHANISTAN - Avalanches and Heavy Snowfalls - January 2008',
                description:
                  'AFGHANISTAN - Avalanches and Heavy Snowfalls - January 2008',
                date: '2008-01-17T00:00:00.000Z',
                glideId: 'AV-2008-000003-AFG',
                levelThree: false,
                active: true,
                restricted: false,
                createdAt: '2017-01-14T00:52:09.434Z',
                updatedAt: '2017-01-14T00:52:09.434Z',
              },
              {
                id: 362,
                name: 'AFGHANISTAN - Floods - November 2006',
                description: 'AFGHANISTAN - Floods - November 2006',
                date: '2006-11-13T00:00:00.000Z',
                glideId: 'FF-2006-000163-AFG',
                levelThree: false,
                active: true,
                restricted: false,
                createdAt: '2017-01-14T00:52:09.267Z',
                updatedAt: '2017-01-14T00:52:09.267Z',
              },
              {
                id: 340,
                name: 'Afghanistan Drought 2006',
                description: '',
                date: '2006-01-01T00:00:00.000Z',
                glideId: null,
                levelThree: false,
                active: true,
                restricted: false,
                createdAt: '2017-01-14T00:52:09.154Z',
                updatedAt: '2017-01-14T00:52:09.154Z',
              },
              {
                id: 286,
                name: 'AFGHANISTAN - Flood - June 2005',
                description: 'AFGHANISTAN - Flood - June 2005',
                date: '2005-06-20T00:00:00.000Z',
                glideId: 'FL-2005-000094-AFG',
                levelThree: false,
                active: true,
                restricted: false,
                createdAt: '2017-01-14T00:52:08.895Z',
                updatedAt: '2017-01-14T00:52:08.895Z',
              },
            ];
          }
        ),
        getEmergency: dummyEndpoint(
          'emergencies.getEmergency',
          async (
            params: emergencies.GetEmergencyParams
          ): Promise<emergencies.GetEmergencyResult> => {
            throw new errors.NotFoundError();
          }
        ),
      },
      flows: {
        getFlowREST: dummyEndpoint('flows.getFlowREST', async () => {
          throw new errors.NotFoundError();
        }),
        getFlow: dummyEndpoint('flows.getFlow', async () => {
          throw new errors.NotFoundError();
        }),
        searchFlowsREST: dummyEndpoint(
          'flows.searchFlowsREST',
          async (params: flows.SearchFlowsRESTParams) => {
            const { flowSearch } = params;
            const { flows } = this.data;

            if (flowSearch.orderBy) {
              flows.sort((a, b) => {
                let returnVal = 0;
                switch (flowSearch.orderBy) {
                  case 'flow.id':
                    returnVal = a.id > b.id ? 1 : -1;
                    break;
                  case 'flow.versionID':
                    returnVal = a.versionID > b.versionID ? 1 : -1;
                    break;
                  case 'flow.updatedAt':
                    returnVal = a.updatedAt > b.updatedAt ? 1 : -1;
                    break;
                  case 'externalReference.systemID':
                    if (
                      a.externalReference?.systemID &&
                      b.externalReference?.systemID
                    ) {
                      returnVal =
                        a.externalReference?.systemID >
                        b.externalReference?.systemID
                          ? 1
                          : -1;
                    }
                    break;
                  case 'flow.amountUSD':
                    returnVal =
                      parseInt(a.amountUSD) > parseInt(b.amountUSD) ? 1 : -1;
                    break;
                  case 'organization.source.name': {
                    const sourceOrgA = a.organizations?.find(
                      (org) => org.refDirection === 'source'
                    );
                    const sourceOrgB = a.organizations?.find(
                      (org) => org.refDirection === 'source'
                    );
                    if (sourceOrgA && sourceOrgB) {
                      returnVal = sourceOrgA.name > sourceOrgB.name ? 1 : -1;
                    }
                    break;
                  }
                  case 'organization.destination.name': {
                    const destOrgA = a.organizations?.find(
                      (org) => org.refDirection === 'destination'
                    );
                    const destOrgB = a.organizations?.find(
                      (org) => org.refDirection === 'destination'
                    );
                    if (destOrgA && destOrgB) {
                      returnVal = destOrgA.name > destOrgB.name ? 1 : -1;
                    }
                    break;
                  }
                  case 'destination.planVersion.name': {
                    const planA = a.plans && a.plans[0];
                    const planB = b.plans && b.plans[0];
                    if (!planA) {
                      returnVal = -1;
                    } else if (!planB) {
                      returnVal = 1;
                    } else {
                      returnVal = planA.name > planB.name ? 1 : -1;
                    }
                    break;
                  }
                  case 'location.destination.name': {
                    const locationA = a.locations && a.locations[0];
                    const locationB = b.locations && b.locations[0];
                    if (!locationA) {
                      returnVal = -1;
                    } else if (!locationB) {
                      returnVal = 1;
                    } else {
                      returnVal = locationA.name > locationB.name ? 1 : -1;
                    }
                    break;
                  }
                  case 'usageYear.destination.year': {
                    const yearA = a.usageYears?.find(
                      (org) => org.refDirection === 'destination'
                    );
                    const yearB = a.usageYears?.find(
                      (org) => org.refDirection === 'destination'
                    );
                    if (yearA && yearB) {
                      returnVal = yearA.year > yearB.year ? 1 : -1;
                    }
                    break;
                  }
                }

                return flowSearch.orderDir === 'DESC'
                  ? returnVal * -1
                  : returnVal;
              });
            }

            return {
              flows,
              flowCount: flows.length.toString(),
            };
          }
        ),
        searchFlows: dummyEndpoint(
          'flows.searchFlows',
          async (params: flows.SearchFlowsParams) => {
            throw new errors.NotFoundError();
          }
        ),
        bulkRejectPendingFlows: dummyEndpoint(
          'flows.bulkRejectPendingFlows',
          async () => {
            throw new errors.NotFoundError();
          }
        ),
        getTotalAmountUSD: dummyEndpoint(
          'flows.getTotalAmountUSD',
          async () => {
            return {
              searchFlowsTotalAmountUSD: {
                totalAmountUSD: '100,639,059.00',
                flowsCount: 6,
              },
            };
          }
        ),
        validateFlow: dummyEndpoint(
          'flows.getVallidateFlow',
          async (params: flows.GetValidateFlowParams) => {
            throw new errors.NotFoundError();
          }
        ),
        createFlow: dummyEndpoint(
          'flows.createFlow',
          async (params: flows.CreateFlowParams) => {
            throw new errors.NotFoundError();
          }
        ),
        deleteFlow: dummyEndpoint(
          'flows.deleteFlow',
          async (params: flows.DeleteFlowParams) => {
            throw new errors.NotFoundError();
          }
        ),
        updateFlow: dummyEndpoint(
          'flows.updateFlow',
          async (params: flows.CreateFlowParams) => {
            throw new errors.NotFoundError();
          }
        ),
        getAutocompleteFlows: dummyEndpoint(
          'flows.searchFlows',
          async (params: flows.GetFlowsAutocompleteParams) => {
            throw new errors.NotFoundError();
          }
        ),
      },
      globalClusters: {
        getGlobalClusters: dummyEndpoint(
          'globalClusters.getGlobalClusters',
          async (): Promise<globalClusters.GetGlobalClustersResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 26512,
                hrinfoId: null,
                type: 'custom',
                name: 'Agriculture',
                code: 'AGR',
                homepage: null,
                defaultIconId: 'other_clusters_agriculture_icon',
                parentId: 6,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2017-11-17T00:06:32.440Z',
                updatedAt: '2021-08-24T11:51:10.748Z',
              },
              {
                id: 1,
                hrinfoId: 1,
                type: 'global',
                name: 'Camp Coordination / Management',
                code: 'CCM',
                homepage: 'http://www.globalcccmcluster.org',
                defaultIconId:
                  'clusters_camp_coordination_and_camp_management_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.465Z',
                updatedAt: '2021-08-24T11:51:20.534Z',
              },
              {
                id: 26480,
                hrinfoId: null,
                type: 'custom',
                name: 'Coordination and support services',
                code: 'CSS',
                homepage: null,
                defaultIconId: 'other_clusters_coordination_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2017-01-14T02:13:20.198Z',
                updatedAt: '2021-08-24T11:51:24.794Z',
              },
              {
                id: 26513,
                hrinfoId: null,
                type: 'custom',
                name: 'COVID-19',
                code: 'COV19',
                homepage: null,
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2020-03-24T12:00:00.000Z',
                updatedAt: '2021-08-24T11:51:28.429Z',
              },
              {
                id: 2,
                hrinfoId: 2,
                type: 'global',
                name: 'Early Recovery',
                code: 'ERY',
                homepage:
                  'https://www.humanitarianresponse.info/en/coordination/clusters/launching-soon',
                defaultIconId: 'clusters_recovery_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.473Z',
                updatedAt: '2021-08-24T11:51:32.528Z',
              },
              {
                id: 3,
                hrinfoId: 3,
                type: 'global',
                name: 'Education',
                code: 'EDU',
                homepage: 'http://educationcluster.net/',
                defaultIconId: 'clusters_education_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.478Z',
                updatedAt: '2021-08-24T11:51:36.239Z',
              },
              {
                id: 4,
                hrinfoId: 4,
                type: 'global',
                name: 'Emergency Shelter and NFI',
                code: 'SHL',
                homepage: 'https://www.sheltercluster.org',
                defaultIconId: 'clusters_shelter_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.481Z',
                updatedAt: '2021-08-24T11:51:39.902Z',
              },
              {
                id: 5,
                hrinfoId: 5,
                type: 'global',
                name: 'Emergency Telecommunications',
                code: 'TEL',
                homepage: 'www.ETCluster.org',
                defaultIconId: 'clusters_emergency_telecommunications_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.485Z',
                updatedAt: '2021-08-24T11:52:01.065Z',
              },
              {
                id: 6,
                hrinfoId: 6,
                type: 'global',
                name: 'Food Security',
                code: 'FSC',
                homepage: 'http://www.foodsecuritycluster.net',
                defaultIconId: 'disaster_flood_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.489Z',
                updatedAt: '2021-08-24T11:52:08.350Z',
              },
              {
                id: 7,
                hrinfoId: 7,
                type: 'global',
                name: 'Health',
                code: 'HEA',
                homepage: 'http://www.who.int/hac/global_health_cluster/en/',
                defaultIconId: 'clusters_health_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.494Z',
                updatedAt: '2021-08-24T11:52:13.708Z',
              },
              {
                id: 8,
                hrinfoId: 8,
                type: 'global',
                name: 'Logistics',
                code: 'LOG',
                homepage: 'http://www.logcluster.org',
                defaultIconId: 'clusters_logistics_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.499Z',
                updatedAt: '2021-08-24T11:52:18.249Z',
              },
              {
                id: 26479,
                hrinfoId: null,
                type: 'custom',
                name: 'Multi-sector',
                code: 'MS',
                homepage: null,
                defaultIconId: 'other_clusters_multi-sector_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2017-01-14T02:13:20.198Z',
                updatedAt: '2021-08-24T11:52:24.427Z',
              },
              {
                id: 9,
                hrinfoId: 9,
                type: 'global',
                name: 'Nutrition',
                code: 'NUT',
                homepage: 'http://nutritioncluster.net',
                defaultIconId: 'clusters_nutrition_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.504Z',
                updatedAt: '2021-08-24T11:52:27.907Z',
              },
              {
                id: 26481,
                hrinfoId: null,
                type: 'custom',
                name: 'Other',
                code: 'OTH',
                homepage: null,
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2017-01-14T02:13:20.198Z',
                updatedAt: '2021-08-24T11:52:31.779Z',
              },
              {
                id: 10,
                hrinfoId: 10,
                type: 'global',
                name: 'Protection',
                code: 'PRO',
                homepage: 'http://www.globalprotectioncluster.org',
                defaultIconId: 'clusters_protection_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2020,
                createdAt: '2015-09-10T20:26:37.507Z',
                updatedAt: '2021-08-10T14:35:25.912Z',
              },
              {
                id: 12,
                hrinfoId: 5403,
                type: 'aor',
                name: 'Protection - Child Protection',
                code: 'PRO-CPN',
                homepage: 'http://www.cpwg.net/',
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: 2020,
                createdAt: '2015-09-10T20:26:37.515Z',
                updatedAt: '2021-08-10T14:35:21.625Z',
              },
              {
                id: 13,
                hrinfoId: 5404,
                type: 'aor',
                name: 'Protection - Gender-Based Violence',
                code: 'PRO-GBV',
                homepage: 'http://www.gbvaor.net/',
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: 2020,
                createdAt: '2015-09-10T20:26:37.519Z',
                updatedAt: '2021-08-10T14:35:17.766Z',
              },
              {
                id: 14,
                hrinfoId: 5405,
                type: 'aor',
                name: 'Protection - Housing, Land and Property',
                code: 'PRO-HLP',
                homepage:
                  'http://www.globalprotectioncluster.org/en/areas-of-responsibility/housing-land-and-property.html',
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: null,
                createdAt: '2015-09-10T20:26:37.524Z',
                updatedAt: '2021-04-26T14:42:40.052Z',
              },
              {
                id: 26546,
                hrinfoId: null,
                type: 'aor',
                name: 'Protection - Human Trafficking & Smuggling',
                code: 'PRO-HTS',
                homepage: null,
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: null,
                createdAt: '2021-02-15T15:48:42.661Z',
                updatedAt: '2021-04-26T14:43:09.171Z',
              },
              {
                id: 15,
                hrinfoId: 5406,
                type: 'aor',
                name: 'Protection - Mine Action',
                code: 'PRO-MIN',
                homepage:
                  'http://www.globalprotectioncluster.org/en/areas-of-responsibility/mine-action.html',
                defaultIconId: null,
                parentId: null,
                displayFTSSummariesFromYear: 2020,
                createdAt: '2015-09-10T20:26:37.529Z',
                updatedAt: '2021-08-10T14:35:13.095Z',
              },
              {
                id: 11,
                hrinfoId: 11,
                type: 'global',
                name: 'Water Sanitation Hygiene',
                code: 'WSH',
                homepage: 'http://washcluster.net/',
                defaultIconId: 'clusters_water_sanitation_and_hygiene_icon',
                parentId: null,
                displayFTSSummariesFromYear: 2012,
                createdAt: '2015-09-10T20:26:37.511Z',
                updatedAt: '2021-08-24T11:52:35.295Z',
              },
            ];
          }
        ),
      },
      governingEntities: {
        getAllPlanGoverningEntities: dummyEndpoint(
          'governingEntities.getAllPlanGoverningEntities',
          async (params: governingEntities.GetGoverningEntityParams) => {
            throw new errors.NotFoundError();
          }
        ),
      },
      locations: {
        getAutocompleteLocations: dummyEndpoint(
          'locations.getAutocompleteLocations',
          async (
            params: locations.GetLocationsAutocompleteParams
          ): Promise<locations.GetLocationsAutocompleteResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 209,
                externalId: '389',
                name: 'Spain',
                adminLevel: 0,
                latitude: 40.309787496783,
                longitude: -3.578125378279,
                iso3: 'ESP',
                pcode: null,
                validOn: null,
                status: 'active',
                itosSync: true,
                createdAt: '2015-09-10T20:25:11.133Z',
                updatedAt: '2023-01-15T00:05:07.209Z',
                parentId: null,
                children: [],
              },
            ];
          }
        ),
        getLocation: dummyEndpoint(
          'locations.getLocation',
          async (
            params: locations.GetLocationParams
          ): Promise<locations.GetLocationResult> => {
            return {
              id: 209,
              externalId: '389',
              name: 'Spain',
              adminLevel: 0,
              latitude: 40.309787496783,
              longitude: -3.578125378279,
              iso3: 'ESP',
              pcode: null,
              validOn: null,
              status: 'active',
              itosSync: true,
              createdAt: '2015-09-10T20:25:11.133Z',
              updatedAt: '2023-01-15T00:05:07.209Z',
              parentId: null,
              children: [],
            };
          }
        ),
      },
      organizations: {
        getAutocompleteOrganizations: dummyEndpoint(
          'organizations.getAutocompleteOrganizations',
          async (
            params: organizations.GetOrganizationsAutocompleteParams
          ): Promise<organizations.GetOrganizationsResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
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
                categories: [
                  {
                    id: 118,
                    name: 'NGOs',
                    description: null,
                    parentID: null,
                    code: null,
                    group: 'organizationType',
                    includeTotals: null,
                    createdAt: '2017-01-13T22:18:02.367Z',
                    updatedAt: '2022-12-15T15:17:12.866Z',
                    categoryRef: {
                      objectID: 9093,
                      versionID: 1,
                      objectType: 'organization',
                      categoryID: 118,
                      createdAt: '2017-10-29T20:45:26.445Z',
                      updatedAt: '2017-10-29T20:45:26.445Z',
                    },
                  },
                  {
                    id: 1810,
                    name: 'National NGOs/CSOs',
                    description: null,
                    parentID: 1802,
                    code: null,
                    group: 'organizationLevel',
                    includeTotals: null,
                    createdAt: '2022-12-15T15:17:15.037Z',
                    updatedAt: '2022-12-15T15:17:15.037Z',
                    categoryRef: {
                      objectID: 9093,
                      versionID: 1,
                      objectType: 'organization',
                      categoryID: 1810,
                      createdAt: '2022-12-15T15:17:25.240Z',
                      updatedAt: '2022-12-15T15:17:25.240Z',
                    },
                  },
                  {
                    id: 1802,
                    name: 'Local and National Non-State Actors',
                    description: null,
                    parentID: null,
                    code: null,
                    group: 'organizationLevel',
                    includeTotals: null,
                    createdAt: '2022-12-15T15:17:12.799Z',
                    updatedAt: '2022-12-15T15:17:12.799Z',
                    categoryRef: {
                      objectID: 9093,
                      versionID: 1,
                      objectType: 'organization',
                      categoryID: 1802,
                      createdAt: '2022-12-15T15:17:25.240Z',
                      updatedAt: '2022-12-15T15:17:25.240Z',
                    },
                  },
                  {
                    id: 130,
                    name: 'National NGOs/CSOs',
                    description: null,
                    parentID: 118,
                    code: null,
                    group: 'organizationType',
                    includeTotals: null,
                    createdAt: '2017-01-13T22:18:02.688Z',
                    updatedAt: '2022-12-15T15:17:15.025Z',
                    categoryRef: {
                      objectID: 9093,
                      versionID: 1,
                      objectType: 'organization',
                      categoryID: 130,
                      createdAt: '2019-05-14T12:18:30.858Z',
                      updatedAt: '2019-05-14T12:18:30.858Z',
                    },
                  },
                ],
              },
            ];
          }
        ),
        searchOrganizations: dummyEndpoint(
          'organizations.searchOrganizations',
          async (
            params: organizations.SearchOrganizationParams
          ): Promise<organizations.SearchOrnganizationResult> => {
            return {
              count: '1',
              organizations: [
                {
                  id: 9093,
                  name: 'Association pour le Secours et le Développement',
                  nativeName: '',
                  abbreviation: 'ASD',
                  active: true,
                  categories: [
                    {
                      name: 'NGOs',
                      group: 'organizationType',
                      parentID: null,
                    },
                  ],
                  locations: [],
                  create: [],
                  update: [],
                },
              ],
            };
          }
        ),
        getOrganization: dummyEndpoint(
          'organizations.getOrganization',
          async (
            params: organizations.GetOrganizationParams
          ): Promise<organizations.GetOrganizationResult> => {
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
              categories: [
                {
                  id: 118,
                  name: 'NGOs',
                  description: null,
                  parentID: null,
                  code: null,
                  group: 'organizationType',
                  includeTotals: null,
                  createdAt: '2017-01-13T22:18:02.367Z',
                  updatedAt: '2022-12-15T15:17:12.866Z',
                  categoryRef: {
                    objectID: 9093,
                    versionID: 1,
                    objectType: 'organization',
                    categoryID: 118,
                    createdAt: '2017-10-29T20:45:26.445Z',
                    updatedAt: '2017-10-29T20:45:26.445Z',
                  },
                },
                {
                  id: 1810,
                  name: 'National NGOs/CSOs',
                  description: null,
                  parentID: 1802,
                  code: null,
                  group: 'organizationLevel',
                  includeTotals: null,
                  createdAt: '2022-12-15T15:17:15.037Z',
                  updatedAt: '2022-12-15T15:17:15.037Z',
                  categoryRef: {
                    objectID: 9093,
                    versionID: 1,
                    objectType: 'organization',
                    categoryID: 1810,
                    createdAt: '2022-12-15T15:17:25.240Z',
                    updatedAt: '2022-12-15T15:17:25.240Z',
                  },
                },
                {
                  id: 1802,
                  name: 'Local and National Non-State Actors',
                  description: null,
                  parentID: null,
                  code: null,
                  group: 'organizationLevel',
                  includeTotals: null,
                  createdAt: '2022-12-15T15:17:12.799Z',
                  updatedAt: '2022-12-15T15:17:12.799Z',
                  categoryRef: {
                    objectID: 9093,
                    versionID: 1,
                    objectType: 'organization',
                    categoryID: 1802,
                    createdAt: '2022-12-15T15:17:25.240Z',
                    updatedAt: '2022-12-15T15:17:25.240Z',
                  },
                },
                {
                  id: 130,
                  name: 'National NGOs/CSOs',
                  description: null,
                  parentID: 118,
                  code: null,
                  group: 'organizationType',
                  includeTotals: null,
                  createdAt: '2017-01-13T22:18:02.688Z',
                  updatedAt: '2022-12-15T15:17:15.025Z',
                  categoryRef: {
                    objectID: 9093,
                    versionID: 1,
                    objectType: 'organization',
                    categoryID: 130,
                    createdAt: '2019-05-14T12:18:30.858Z',
                    updatedAt: '2019-05-14T12:18:30.858Z',
                  },
                },
              ],
              locations: [],
            };
          }
        ),
        getOrganizationsById: dummyEndpoint(
          'organizations.getOrganizationsById',
          async (params: organizations.GetOrganizationsByIdParams) => {
            throw new errors.NotFoundError();
          }
        ),
        createOrganization: dummyEndpoint(
          'organizations.createOrganization',
          async (
            params: organizations.CreateOrganizationParams
          ): Promise<organizations.CreateOrganizationResult> => {
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
              meta: { language: 'en' },
            };
          }
        ),
        updateOrganization: dummyEndpoint(
          'organizations.updateOrganization',
          async (
            params: organizations.UpdateOrganizationParams
          ): Promise<organizations.UpdateOrganizationResult> => {
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
              participantLog: [
                {
                  createdAt: '2017-10-29T20:45:26.233Z',
                  editType: 'created',
                  participant: {
                    name: 'HPC Admin',
                  },
                },
              ],
            };
          }
        ),
        deleteOrganization: dummyEndpoint(
          'organizations.deleteOrganization',
          async (
            params: organizations.DeleteOrganizationParams
          ): Promise<organizations.DeleteOrganizationResult> => {
            return undefined;
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
          async (
            params: plans.GetPlansAutocompleteParams
          ): Promise<plans.GetPlansAutocompleteResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 1117,
                restricted: false,
                revisionState: 'none',
                createdAt: '2023-05-18T09:14:13.164Z',
                updatedAt: '2023-05-18T09:14:13.164Z',
                planVersionId: 4581,
                planId: 1117,
                name: 'Afghanistan Humanitarian Response Plan 2023',
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG23',
                customLocationCode: null,
                currentReportingPeriodId: 2611,
                lastPublishedReportingPeriodId: 2610,
                clusterSelectionType: 'multi',
                currentVersion: false,
                latestVersion: true,
                latestTaggedVersion: false,
                versionTags: [],
              },
              {
                id: 1118,
                restricted: false,
                revisionState: 'none',
                createdAt: '2023-03-22T07:55:33.041Z',
                updatedAt: '2023-03-22T07:56:31.621Z',
                planVersionId: 4505,
                planId: 1118,
                name: 'Afghanistan Situation Regional Refugee Response Plan 2023',
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                comments: null,
                isForHPCProjects: true,
                code: 'RAFG23',
                customLocationCode: 'AFG',
                currentReportingPeriodId: 2425,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: 'multi',
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0'],
              },
              {
                id: 1061,
                restricted: false,
                revisionState: 'none',
                createdAt: '2022-11-17T15:10:10.885Z',
                updatedAt: '2022-11-17T15:12:10.657Z',
                planVersionId: 4279,
                planId: 1061,
                name: 'Afghanistan Situation Regional Refugee Response Plan 2022',
                startDate: '2022-01-01',
                endDate: '2022-12-31',
                comments: null,
                isForHPCProjects: true,
                code: 'RAFG22',
                customLocationCode: 'AFG',
                currentReportingPeriodId: 1916,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: 'multi',
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.2'],
              },
              {
                id: 1100,
                restricted: false,
                revisionState: 'none',
                createdAt: '2023-01-11T09:58:10.749Z',
                updatedAt: '2023-04-06T10:18:30.355Z',
                planVersionId: 4355,
                planId: 1100,
                name: 'Afghanistan Humanitarian Response Plan 2022',
                startDate: '2022-01-01',
                endDate: '2022-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG22',
                customLocationCode: null,
                currentReportingPeriodId: 2305,
                lastPublishedReportingPeriodId: 2305,
                clusterSelectionType: 'multi',
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.16'],
              },
              {
                id: 1057,
                restricted: false,
                revisionState: 'none',
                createdAt: '2021-09-13T15:21:07.390Z',
                updatedAt: '2021-11-25T12:23:50.198Z',
                planVersionId: 3295,
                planId: 1057,
                name: 'Afghanistan Flash Appeal 2021',
                startDate: '2021-09-01',
                endDate: '2021-12-31',
                comments: null,
                isForHPCProjects: true,
                code: 'FAFG21',
                customLocationCode: null,
                currentReportingPeriodId: 1795,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: 'multi',
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0', '1.1', '1.2', '1.3', '1.4'],
              },
              {
                id: 1031,
                restricted: false,
                revisionState: 'none',
                createdAt: '2022-01-17T12:07:34.469Z',
                updatedAt: '2022-06-08T10:01:42.578Z',
                planVersionId: 3682,
                planId: 1031,
                name: 'Afghanistan Humanitarian Response Plan 2021',
                startDate: '2021-01-01',
                endDate: '2021-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG21',
                customLocationCode: null,
                currentReportingPeriodId: 1616,
                lastPublishedReportingPeriodId: 1616,
                clusterSelectionType: 'multi',
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['3.4'],
              },
              {
                id: 929,
                restricted: false,
                revisionState: 'none',
                createdAt: '2021-01-15T05:45:32.662Z',
                updatedAt: '2021-01-15T05:45:32.662Z',
                planVersionId: 2978,
                planId: 929,
                name: 'Afghanistan 2020',
                startDate: '2020-01-01',
                endDate: '2020-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG20',
                customLocationCode: null,
                currentReportingPeriodId: 1282,
                lastPublishedReportingPeriodId: 1281,
                clusterSelectionType: 'multi',
                currentVersion: false,
                latestVersion: true,
                latestTaggedVersion: false,
                versionTags: [],
              },
              {
                id: 672,
                restricted: false,
                revisionState: 'planDataOnly',
                createdAt: '2019-12-09T10:05:41.234Z',
                updatedAt: '2019-12-09T10:05:41.314Z',
                planVersionId: 1704,
                planId: 672,
                name: 'Afghanistan 2019',
                startDate: '2019-01-01',
                endDate: '2019-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG19',
                customLocationCode: null,
                currentReportingPeriodId: 677,
                lastPublishedReportingPeriodId: 677,
                clusterSelectionType: null,
                currentVersion: false,
                latestVersion: true,
                latestTaggedVersion: false,
                versionTags: [],
              },
              {
                id: 645,
                restricted: false,
                revisionState: 'none',
                createdAt: '2017-10-18T18:14:47.878Z',
                updatedAt: '2022-05-13T13:44:54.926Z',
                planVersionId: 524,
                planId: 645,
                name: 'Afghanistan 2018',
                startDate: '2018-01-01',
                endDate: '2018-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG18',
                customLocationCode: null,
                currentReportingPeriodId: 375,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: null,
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0', '2.0'],
              },
              {
                id: 544,
                restricted: false,
                revisionState: 'none',
                createdAt: '2017-01-14T00:52:56.049Z',
                updatedAt: '2018-05-01T14:44:45.409Z',
                planVersionId: 526,
                planId: 544,
                name: 'Afghanistan 2017',
                startDate: '2017-01-01',
                endDate: '2017-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG17',
                customLocationCode: null,
                currentReportingPeriodId: 170,
                lastPublishedReportingPeriodId: 170,
                clusterSelectionType: null,
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0'],
              },
              {
                id: 525,
                restricted: false,
                revisionState: null,
                createdAt: '2017-01-14T00:52:56.005Z',
                updatedAt: '2017-02-22T17:18:26.096Z',
                planVersionId: 504,
                planId: 525,
                name: 'Afghanistan Flash Appeal: One million people on the move (September - December 2016)',
                startDate: '2016-09-01',
                endDate: '2016-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'FAFG16',
                customLocationCode: null,
                currentReportingPeriodId: null,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: null,
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0'],
              },
              {
                id: 512,
                restricted: false,
                revisionState: null,
                createdAt: '2017-01-14T00:52:55.964Z',
                updatedAt: '2017-02-22T17:18:25.908Z',
                planVersionId: 464,
                planId: 512,
                name: 'Afghanistan 2016',
                startDate: '2016-01-01',
                endDate: '2016-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG16',
                customLocationCode: null,
                currentReportingPeriodId: null,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: null,
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0'],
              },
              {
                id: 462,
                restricted: false,
                revisionState: null,
                createdAt: '2017-01-14T00:52:55.823Z',
                updatedAt: '2017-02-22T17:18:25.039Z',
                planVersionId: 1082,
                planId: 462,
                name: 'Afghanistan 2015',
                startDate: '2015-01-01',
                endDate: '2015-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG15',
                customLocationCode: null,
                currentReportingPeriodId: null,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: null,
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0'],
              },
              {
                id: 426,
                restricted: false,
                revisionState: null,
                createdAt: '2017-01-14T00:52:55.726Z',
                updatedAt: '2017-02-22T17:18:24.205Z',
                planVersionId: 997,
                planId: 426,
                name: 'Afghanistan 2014',
                startDate: '2014-01-01',
                endDate: '2014-12-31',
                comments: null,
                isForHPCProjects: false,
                code: 'HAFG14',
                customLocationCode: null,
                currentReportingPeriodId: null,
                lastPublishedReportingPeriodId: null,
                clusterSelectionType: null,
                currentVersion: true,
                latestVersion: true,
                latestTaggedVersion: true,
                versionTags: ['1.0'],
              },
            ];
          }
        ),
        getPlan: dummyEndpoint(
          'plans.getPlan',
          async (params: plans.GetPlanParams): Promise<plans.GetPlanResult> => {
            throw new errors.NotFoundError();
          }
        ),
      },
      projects: {
        getAutocompleteProjects: dummyEndpoint(
          'projects.getAutocompleteProjects',
          async (
            params: projects.GetProjectsAutocompleteParams
          ): Promise<projects.GetProjectsAutocompleteResult> => {
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 1987,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.141Z',
                code: 'apts626',
                currentPublishedVersionId: 3974,
                creatorParticipantId: null,
                latestVersionId: 3974,
                implementationStatus: 'Implementing',
                pdf: null,
                sourceProjectId: null,
                name: 'Return of Qualified Afghans (RQA)',
                version: 2,
                projectVersionCode: 'apts626',
                visible: true,
              },
              {
                id: 1988,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.153Z',
                code: 'apts627',
                currentPublishedVersionId: 3976,
                creatorParticipantId: null,
                latestVersionId: 3976,
                implementationStatus: 'Implementing',
                pdf: null,
                sourceProjectId: null,
                name: 'Health and Nutrition in old refugee camps and urban communities with large Afghan refugees in Pakistan',
                version: 2,
                projectVersionCode: 'apts627',
                visible: true,
              },
              {
                id: 1989,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.185Z',
                code: 'apts628',
                currentPublishedVersionId: 3978,
                creatorParticipantId: null,
                latestVersionId: 3978,
                implementationStatus: 'Implementing',
                pdf: null,
                sourceProjectId: null,
                name: 'Logistics and Field Coordination for Afghanistan operations',
                version: 2,
                projectVersionCode: 'apts628',
                visible: true,
              },
              {
                id: 1991,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.306Z',
                code: 'apts630',
                currentPublishedVersionId: 3982,
                creatorParticipantId: null,
                latestVersionId: 3982,
                implementationStatus: 'Implementing',
                pdf: null,
                sourceProjectId: null,
                name: 'Promotion of Safe Motherhood in Afghanistan',
                version: 2,
                projectVersionCode: 'apts630',
                visible: true,
              },
              {
                id: 2001,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.819Z',
                code: 'apts641',
                currentPublishedVersionId: 4002,
                creatorParticipantId: null,
                latestVersionId: 4002,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Formal and non-formal education for Afghan Refugee children (boys and girls) at Roghani Camps 1 & 2, Chaman',
                version: 2,
                projectVersionCode: 'apts641',
                visible: true,
              },
              {
                id: 2002,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.909Z',
                code: 'apts645',
                currentPublishedVersionId: 4004,
                creatorParticipantId: null,
                latestVersionId: 4004,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Support to 9 supplementary feeding centers & 3 therapeutic feeding centers in Afghanistan',
                version: 2,
                projectVersionCode: 'apts645',
                visible: true,
              },
              {
                id: 2004,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:57.938Z',
                code: 'apts647',
                currentPublishedVersionId: 4008,
                creatorParticipantId: null,
                latestVersionId: 4008,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Support to Kabul central laboratory and  11 provincial laboratories in Afghanistan',
                version: 2,
                projectVersionCode: 'apts647',
                visible: true,
              },
              {
                id: 2027,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.008Z',
                code: 'apts673',
                currentPublishedVersionId: 4054,
                creatorParticipantId: null,
                latestVersionId: 4054,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Engineering programme for Afghanistan-I',
                version: 2,
                projectVersionCode: 'apts673',
                visible: true,
              },
              {
                id: 2028,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.019Z',
                code: 'apts674',
                currentPublishedVersionId: 4056,
                creatorParticipantId: null,
                latestVersionId: 4056,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Construction of 600 wells and 7 water supply systems in 12 target districts of Northern Afghanistan',
                version: 2,
                projectVersionCode: 'apts674',
                visible: true,
              },
              {
                id: 2043,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.639Z',
                code: 'apts690',
                currentPublishedVersionId: 4086,
                creatorParticipantId: null,
                latestVersionId: 4086,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Basic Mental Health Care Project, in Ningarhar province, Afghanistan.',
                version: 2,
                projectVersionCode: 'apts690',
                visible: true,
              },
              {
                id: 2045,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.686Z',
                code: 'apts692',
                currentPublishedVersionId: 4090,
                creatorParticipantId: null,
                latestVersionId: 4090,
                implementationStatus: 'Implementing',
                pdf: null,
                sourceProjectId: null,
                name: 'Control of Vector-Borne Diseases in Afghanistan:·\tPrevention and Control of Malaria ·\tAlleviation of Suffering from Cutaneous Leishmaniasis',
                version: 2,
                projectVersionCode: 'apts692',
                visible: true,
              },
              {
                id: 2046,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.740Z',
                code: 'apts693',
                currentPublishedVersionId: 4092,
                creatorParticipantId: null,
                latestVersionId: 4092,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Afghan Refugee Assistance and Administrative Support',
                version: 2,
                projectVersionCode: 'apts693',
                visible: true,
              },
              {
                id: 2047,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.810Z',
                code: 'apts694',
                currentPublishedVersionId: 4094,
                creatorParticipantId: null,
                latestVersionId: 4094,
                implementationStatus: 'Implementing',
                pdf: null,
                sourceProjectId: null,
                name: 'Health Care Support Project (HCSP), Ningarhar Province Afghanistan.',
                version: 2,
                projectVersionCode: 'apts694',
                visible: true,
              },
              {
                id: 2048,
                createdAt: '2002-02-28T00:00:00.000Z',
                updatedAt: '2017-02-06T20:16:59.822Z',
                code: 'apts695',
                currentPublishedVersionId: 4096,
                creatorParticipantId: null,
                latestVersionId: 4096,
                implementationStatus: 'Planning',
                pdf: null,
                sourceProjectId: null,
                name: 'Afghan Refugee Health and Education',
                version: 2,
                projectVersionCode: 'apts695',
                visible: true,
              },
            ];
          }
        ),
        getProject: dummyEndpoint(
          'projects.getProject',
          async (params: projects.GetProjectParams) => {
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
            // Implement the dummy data retrieval logic here
            // Replace the following line with the actual implementation
            return [
              {
                id: 20,
                year: '1999',
                createdAt: '2016-02-23T15:03:30.774Z',
                updatedAt: '2016-02-23T15:03:30.774Z',
              },
              {
                id: 21,
                year: '2000',
                createdAt: '2016-02-23T15:03:30.779Z',
                updatedAt: '2016-02-23T15:03:30.779Z',
              },
              {
                id: 22,
                year: '2001',
                createdAt: '2016-02-23T15:03:30.783Z',
                updatedAt: '2016-02-23T15:03:30.783Z',
              },
              {
                id: 23,
                year: '2002',
                createdAt: '2016-02-23T15:03:30.796Z',
                updatedAt: '2016-02-23T15:03:30.796Z',
              },
              {
                id: 24,
                year: '2003',
                createdAt: '2016-02-23T15:03:30.804Z',
                updatedAt: '2016-02-23T15:03:30.804Z',
              },
              {
                id: 25,
                year: '2004',
                createdAt: '2016-02-23T15:03:30.806Z',
                updatedAt: '2016-02-23T15:03:30.806Z',
              },
              {
                id: 26,
                year: '2005',
                createdAt: '2016-02-23T15:03:30.808Z',
                updatedAt: '2016-02-23T15:03:30.808Z',
              },
              {
                id: 27,
                year: '2006',
                createdAt: '2016-02-23T15:03:30.816Z',
                updatedAt: '2016-02-23T15:03:30.816Z',
              },
              {
                id: 28,
                year: '2007',
                createdAt: '2016-02-23T15:03:30.827Z',
                updatedAt: '2016-02-23T15:03:30.827Z',
              },
              {
                id: 29,
                year: '2008',
                createdAt: '2016-02-23T15:03:30.830Z',
                updatedAt: '2016-02-23T15:03:30.830Z',
              },
              {
                id: 30,
                year: '2009',
                createdAt: '2016-02-23T15:03:30.832Z',
                updatedAt: '2016-02-23T15:03:30.832Z',
              },
              {
                id: 31,
                year: '2010',
                createdAt: '2016-02-23T15:03:30.840Z',
                updatedAt: '2016-02-23T15:03:30.840Z',
              },
              {
                id: 32,
                year: '2011',
                createdAt: '2016-02-23T15:03:30.852Z',
                updatedAt: '2016-02-23T15:03:30.852Z',
              },
              {
                id: 33,
                year: '2012',
                createdAt: '2016-02-23T15:03:30.862Z',
                updatedAt: '2016-02-23T15:03:30.862Z',
              },
              {
                id: 34,
                year: '2014',
                createdAt: '2016-02-23T15:03:30.870Z',
                updatedAt: '2016-02-23T15:03:30.870Z',
              },
              {
                id: 35,
                year: '2013',
                createdAt: '2016-02-23T15:03:30.875Z',
                updatedAt: '2016-02-23T15:03:30.875Z',
              },
              {
                id: 36,
                year: '2016',
                createdAt: '2016-02-23T15:03:30.879Z',
                updatedAt: '2016-02-23T15:03:30.879Z',
              },
              {
                id: 37,
                year: '2015',
                createdAt: '2016-02-23T15:03:30.883Z',
                updatedAt: '2016-02-23T15:03:30.883Z',
              },
              {
                id: 38,
                year: '2017',
                createdAt: '2016-02-23T15:03:30.890Z',
                updatedAt: '2016-02-23T15:03:30.890Z',
              },
              {
                id: 39,
                year: '2018',
                createdAt: '2016-02-23T15:03:30.903Z',
                updatedAt: '2016-02-23T15:03:30.903Z',
              },
              {
                id: 40,
                year: '2019',
                createdAt: '2016-02-23T15:03:30.909Z',
                updatedAt: '2016-02-23T15:03:30.909Z',
              },
              {
                id: 41,
                year: '2020',
                createdAt: '2016-02-23T15:03:30.916Z',
                updatedAt: '2016-02-23T15:03:30.916Z',
              },
              {
                id: 42,
                year: '2021',
                createdAt: '2016-02-23T15:03:30.923Z',
                updatedAt: '2016-02-23T15:03:30.923Z',
              },
              {
                id: 43,
                year: '2022',
                createdAt: '2016-02-23T15:03:30.928Z',
                updatedAt: '2016-02-23T15:03:30.928Z',
              },
              {
                id: 44,
                year: '2023',
                createdAt: '2016-02-23T15:03:30.941Z',
                updatedAt: '2016-02-23T15:03:30.941Z',
              },
              {
                id: 45,
                year: '2024',
                createdAt: '2016-02-23T15:03:30.953Z',
                updatedAt: '2016-02-23T15:03:30.953Z',
              },
              {
                id: 46,
                year: '2025',
                createdAt: '2016-02-23T15:03:30.955Z',
                updatedAt: '2016-02-23T15:03:30.955Z',
              },
              {
                id: 47,
                year: '2026',
                createdAt: '2016-02-23T15:03:30.959Z',
                updatedAt: '2016-02-23T15:03:30.959Z',
              },
              {
                id: 48,
                year: '2027',
                createdAt: '2016-02-23T15:03:30.975Z',
                updatedAt: '2016-02-23T15:03:30.975Z',
              },
              {
                id: 49,
                year: '2028',
                createdAt: '2016-02-23T15:03:30.984Z',
                updatedAt: '2016-02-23T15:03:30.984Z',
              },
              {
                id: 50,
                year: '2029',
                createdAt: '2016-02-23T15:03:30.990Z',
                updatedAt: '2016-02-23T15:03:30.990Z',
              },
              {
                id: 51,
                year: '2030',
                createdAt: '2016-02-23T15:03:30.993Z',
                updatedAt: '2016-02-23T15:03:30.993Z',
              },
              {
                id: 52,
                year: '2031',
                createdAt: '2016-02-23T15:03:31.000Z',
                updatedAt: '2016-02-23T15:03:31.000Z',
              },
              {
                id: 53,
                year: '2033',
                createdAt: '2016-02-23T15:03:31.008Z',
                updatedAt: '2016-02-23T15:03:31.008Z',
              },
              {
                id: 54,
                year: '2034',
                createdAt: '2016-02-23T15:03:31.016Z',
                updatedAt: '2016-02-23T15:03:31.016Z',
              },
              {
                id: 55,
                year: '2032',
                createdAt: '2016-02-23T15:03:31.020Z',
                updatedAt: '2016-02-23T15:03:31.020Z',
              },
              {
                id: 56,
                year: '2035',
                createdAt: '2016-02-23T15:03:31.025Z',
                updatedAt: '2016-02-23T15:03:31.025Z',
              },
              {
                id: 57,
                year: '2036',
                createdAt: '2016-02-23T15:03:31.028Z',
                updatedAt: '2016-02-23T15:03:31.028Z',
              },
              {
                id: 58,
                year: '2037',
                createdAt: '2016-02-23T15:03:31.043Z',
                updatedAt: '2016-02-23T15:03:31.043Z',
              },
              {
                id: 59,
                year: '2038',
                createdAt: '2016-02-23T15:03:31.049Z',
                updatedAt: '2016-02-23T15:03:31.049Z',
              },
              {
                id: 60,
                year: '2039',
                createdAt: '2016-02-23T15:03:31.057Z',
                updatedAt: '2016-02-23T15:03:31.057Z',
              },
              {
                id: 61,
                year: '2040',
                createdAt: '2016-02-23T15:03:31.062Z',
                updatedAt: '2016-02-23T15:03:31.062Z',
              },
              {
                id: 62,
                year: '2042',
                createdAt: '2016-02-23T15:03:31.070Z',
                updatedAt: '2016-02-23T15:03:31.070Z',
              },
              {
                id: 63,
                year: '2043',
                createdAt: '2016-02-23T15:03:31.073Z',
                updatedAt: '2016-02-23T15:03:31.073Z',
              },
            ];
          }
        ),
      },
      currencies: {
        getCurrencies: dummyEndpoint(
          'currencies.getCurrencies',
          async (): Promise<currencies.GetCurrenciesResult> => {
            return [
              {
                id: 2,
                code: 'ADP',
                createdAt: '2017-01-14T00:52:05.157Z',
                updatedAt: '2017-01-14T00:52:05.157Z',
              },
              {
                id: 1,
                code: 'AED',
                createdAt: '2017-01-14T00:52:05.157Z',
                updatedAt: '2017-01-14T00:52:05.157Z',
              },
              {
                id: 3,
                code: 'AFA',
                createdAt: '2017-01-14T00:52:05.157Z',
                updatedAt: '2017-01-14T00:52:05.157Z',
              },
              {
                id: 7,
                code: 'AFN',
                createdAt: '2017-01-14T00:52:05.167Z',
                updatedAt: '2017-01-14T00:52:05.167Z',
              },
              {
                id: 8,
                code: 'ALL',
                createdAt: '2017-01-14T00:52:05.167Z',
                updatedAt: '2017-01-14T00:52:05.167Z',
              },
              {
                id: 4,
                code: 'AMD',
                createdAt: '2017-01-14T00:52:05.167Z',
                updatedAt: '2017-01-14T00:52:05.167Z',
              },
              {
                id: 5,
                code: 'ANG',
                createdAt: '2017-01-14T00:52:05.167Z',
                updatedAt: '2017-01-14T00:52:05.167Z',
              },
              {
                id: 6,
                code: 'AOA',
                createdAt: '2017-01-14T00:52:05.167Z',
                updatedAt: '2017-01-14T00:52:05.167Z',
              },
              {
                id: 9,
                code: 'AON',
                createdAt: '2017-01-14T00:52:05.181Z',
                updatedAt: '2017-01-14T00:52:05.181Z',
              },
              {
                id: 10,
                code: 'AOR',
                createdAt: '2017-01-14T00:52:05.181Z',
                updatedAt: '2017-01-14T00:52:05.181Z',
              },
              {
                id: 11,
                code: 'ARS',
                createdAt: '2017-01-14T00:52:05.181Z',
                updatedAt: '2017-01-14T00:52:05.181Z',
              },
              {
                id: 12,
                code: 'ATS',
                createdAt: '2017-01-14T00:52:05.181Z',
                updatedAt: '2017-01-14T00:52:05.181Z',
              },
              {
                id: 13,
                code: 'AUD',
                createdAt: '2017-01-14T00:52:05.181Z',
                updatedAt: '2017-01-14T00:52:05.181Z',
              },
              {
                id: 14,
                code: 'AWG',
                createdAt: '2017-01-14T00:52:05.193Z',
                updatedAt: '2017-01-14T00:52:05.193Z',
              },
              {
                id: 15,
                code: 'AZM',
                createdAt: '2017-01-14T00:52:05.194Z',
                updatedAt: '2017-01-14T00:52:05.194Z',
              },
              {
                id: 16,
                code: 'BAD',
                createdAt: '2017-01-14T00:52:05.194Z',
                updatedAt: '2017-01-14T00:52:05.194Z',
              },
              {
                id: 17,
                code: 'BAM',
                createdAt: '2017-01-14T00:52:05.194Z',
                updatedAt: '2017-01-14T00:52:05.194Z',
              },
            ];
          }
        ),
      },
    };
  };
}
