import { PathReporter } from 'io-ts/lib/PathReporter';
import { Session } from '@unocha/hpc-core';
import {
  Model,
  access,
  operations,
  reportingWindows,
  errors,
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
    new Promise<Data>((resolve, reject) => {
      console.log('[DUMMY] Endpoint Called: ', name, ...args);
      if (Math.random() > 0.1) {
        setTimeout(
          () =>
            resolve(
              fn(...args).then((data) => {
                console.log(
                  '[DUMMY] Endpoint Resolving: ',
                  name,
                  ...args,
                  data
                );
                return data;
              })
            ),
          300
        );
      } else {
        setTimeout(() => reject(new Error('A random error ocurred!')), 300);
      }
    });
}

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
    };
  };
}
