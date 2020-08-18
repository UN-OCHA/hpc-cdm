import { DummyData } from './data-types';

/**
 * TODO: Something weird is going on with these json imports, it's importing
 * them with default rather than importing them directly... this is definitely
 * not what's supposed to happen and we should look into that...
 */
import * as formAImport from './forms/form-a.json';
import * as formCImport from './forms/form-c.json';
let formA = formAImport;
let formC = formCImport;
if ((formA as any).default) {
  formA = (formA as any).default;
}
if ((formC as any).default) {
  formC = (formC as any).default;
}

export const INITIAL_DATA: DummyData = {
  users: [
    {
      id: 0,
      user: {
        name: 'Admin User',
      },
      permissions: [],
    },
    {
      id: 1,
      user: {
        name: 'Operation Lead',
      },
      permissions: [],
    },
    {
      id: 2,
      user: {
        name: 'Cluster Lead',
      },
      permissions: [],
    },
  ],
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
  operationClusters: [
    {
      id: 10,
      operationId: 1,
      abbreviation: 'CCM',
      name: 'Camp Coordination & Management',
    },
    {
      id: 11,
      operationId: 1,
      abbreviation: 'EDU',
      name: 'Education',
    },
    {
      id: 12,
      operationId: 1,
      abbreviation: 'HEA',
      name: 'Health',
    },
    {
      id: 13,
      operationId: 1,
      abbreviation: 'PRO',
      name: 'Protection',
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
      assignments: [
        {
          id: 9932,
          type: 'form',
          formId: 123,
          assignee: {
            type: 'operation',
            operationId: 1,
          },
          state: 'not-entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5925,
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operation',
            operationId: 1,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5926,
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operationCluster',
            clusterId: 11,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
      ],
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
  forms: [
    {
      id: 123,
      version: 1,
      name: 'A Form',
      definition: formA,
    },
    {
      id: 321,
      version: 1,
      name: 'Another form',
      definition: formC,
    },
  ],
};
