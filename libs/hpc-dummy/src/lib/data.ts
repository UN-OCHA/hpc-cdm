import { DummyData } from './data-types';

export const INITIAL_DATA: DummyData = {
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
          currentData: 'this is some data',
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
          currentData: 'this is some data',
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
          currentData: 'this is some data',
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
      name: 'A Form',
      definition: 'This is the form definition',
    },
    {
      id: 321,
      name: 'Another form',
      definition: 'This is the form definition',
    },
  ],
};
