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
 * Simulate a positive API response with a bit of a delay
 */
const simulateResponse = <T>(value: T | Promise<T>) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 300);
  });

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
      getUser: () => this.data.currentUser?.user,
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
        getOperations: () =>
          simulateResponse({
            data: this.data.operations,
            permissions: {
              canAddOperation: true,
            },
          }),
      },
    };
  };
}
