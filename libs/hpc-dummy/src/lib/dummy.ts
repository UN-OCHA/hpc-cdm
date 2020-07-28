import { Session } from '@unocha/hpc-core';
import { Model, operations, reportingWindows, errors } from '@unocha/hpc-data';

import { Assignment, DummyData, DUMMY_DATA } from './data-types';
import { INITIAL_DATA } from './data';

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

  constructor() {
    this.data = INITIAL_DATA;

    window.addEventListener('storage', this.load);
    this.load();
  }

  private load = () => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      try {
        this.data = JSON.parse(s);
        if (!DUMMY_DATA.is(this.data)) {
          if (
            window.confirm(
              `The stored dummy data doesn't match the current type definitions, ` +
                `do you want to reset it to the default?`
            )
          ) {
            this.data = INITIAL_DATA;
            this.store();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  private store = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  };

  public getSession = (): Session => {
    return {
      getCurrentLanguage: () => {
        throw new Error('Not Implemented');
      },
      getUser: () => this.data.currentUser?.user || null,
      logIn: () => {
        this.data.currentUser = {
          user: {
            name: 'Dummy User',
          },
          permissions: [],
        };
        this.store();
        window.location.reload();
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

  public getModel = (): Model => {
    return {
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
                },
                permissions: {},
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
              data: this.data.operationClusters.filter(
                (cl) => cl.operationId === operationId
              ),
              permissions: {},
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
                      form: this.getFormMeta(a.formId),
                    })),
                })),
            };
            return r;
          }
        ),
        getAssignment: dummyEndpoint(
          'reportingWindows.getAssignment',
          async (params: reportingWindows.GetAssignmentParams) => {
            const { reportingWindowId, assignmentId } = params;
            const window = this.data.reportingWindows.filter(
              (w) => w.id === reportingWindowId
            );
            if (window.length === 0) {
              throw new errors.NotFoundError();
            }
            const assignment = window[0].assignments.filter(
              (a) => a.id === assignmentId
            );
            if (assignment.length === 0) {
              throw new errors.NotFoundError();
            }
            const a = assignment[0];

            const getAssignmentTask = (a: Assignment) => {
              if (a.type === 'form') {
                const form = this.data.forms.filter((f) => f.id === a.formId);
                if (form.length === 0) {
                  throw new Error('missing form');
                }
                return {
                  type: 'form' as 'form',
                  form: form[0],
                  currentData: a.currentData,
                };
              } else {
                throw new Error('Unknown type');
              }
            };

            const r: reportingWindows.GetAssignmentResult = {
              id: a.id,
              state: a.state,
              task: getAssignmentTask(a),
              assignee: a.assignee,
            };
            return r;
          }
        ),
      },
    };
  };
}
