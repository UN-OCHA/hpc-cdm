import { Session, SessionUser } from '@unocha/hpc-core';
import { Model, Operations } from '@unocha/hpc-data';

interface DummyData {
  currentUser: {
    user: SessionUser;
    permissions: string[];
  } | null;
  operations: Operations.Operation[];
}

const INITIAL_DATA: DummyData = {
  currentUser: null,
  operations: [
    {
      id: 0,
      name: 'Operation 1',
    },
    {
      id: 1,
      name: 'Operation 2',
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
  fn: () => Data | Promise<Data>
): () => Promise<Data>;
function dummyEndpoint<Args extends [unknown, ...unknown[]], Data>(
  name: string,
  fn: (...data: Args) => Data | Promise<Data>
): (...args: Args) => Promise<Data>;
function dummyEndpoint<Args extends [unknown, ...unknown[]], Data>(
  name: string,
  fn: (...data: Args) => Promise<Data>
): (...args: Args) => Promise<Data> {
  return (...args: Args) =>
    new Promise<Data>((resolve, reject) => {
      console.log('Endpoint Called: ', name, args);
      if (Math.random() > 0.5) {
        setTimeout(() => resolve(fn(...args)), 300);
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
        getOperations: dummyEndpoint('operations.getOperations', () => ({
          data: this.data.operations,
          permissions: {
            canAddOperation: true,
          },
        })),
        getOperation: dummyEndpoint(
          'operations.getOperation',
          async (id: number) => {
            const op = this.data.operations.filter((op) => op.id === id);
            if (op.length === 1) {
              return {
                data: op[0],
                permissions: {},
              };
            }
            throw new Error('not found');
          }
        ),
      },
    };
  };
}
