import { Session, SessionUser } from '@unocha/hpc-core';
import { Model, operations, reportingWindows, errors } from '@unocha/hpc-data';

interface ReportingWindow extends reportingWindows.ReportingWindow {
  associations: {
    operations: number[];
  };
  assignments: [];
}

interface DummyData {
  currentUser: {
    user: SessionUser;
    permissions: string[];
  } | null;
  operations: operations.Operation[];
  reportingWindows: ReportingWindow[];
}

const INITIAL_DATA: DummyData = {
  currentUser: null,
  operations: [
    {
      id: 0,
      name: 'Operation with no reporting window',
    },
    {
      id: 1,
      name: 'Operation with a reporting window',
    },
    {
      id: 2,
      name: 'Operation with multiple reporting windows',
    },
  ],
  reportingWindows: [
    {
      id: 0,
      name: 'Some Reporting Window',
      state: 'open',
      associations: {
        operations: [1, 2],
      },
      assignments: [],
    },
    {
      id: 0,
      name: 'Another Reporting Window',
      state: 'pending',
      associations: {
        operations: [2],
      },
      assignments: [],
    },
  ],
};

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
        // TODO: add more robust handling of missing data
        // using io-ts with ability to reset to dummy
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
      },
    };
  };
}
