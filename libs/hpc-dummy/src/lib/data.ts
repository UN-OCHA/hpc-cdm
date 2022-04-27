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
if ('default' in formA) {
  formA = (formA as unknown as { default: typeof formA }).default;
}
if ('default' in formC) {
  formC = (formC as unknown as { default: typeof formC }).default;
}

export const INITIAL_DATA: DummyData = {
  access: {
    active: [
      {
        target: { type: 'global' },
        grantee: {
          type: 'user',
          id: 0,
        },
        roles: ['hpc_admin'],
      },
    ],
    invites: [],
    auditLog: [],
  },
  users: [
    {
      id: 0,
      user: {
        name: 'Admin User',
      },
      email: 'admin@example.com',
    },
    {
      id: 1,
      user: {
        name: 'Operation Lead',
      },
      email: 'oplead@example.com',
    },
    {
      id: 2,
      user: {
        name: 'Cluster Lead',
      },
      email: 'cllead@example.com',
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
      name: 'Operation with a reporting window, and cluster and operation assignments',
    },
    {
      id: 2,
      name: 'Operation with multiple reporting windows',
    },
    {
      id: 3,
      name: 'Operation with a reporting window, and cluster assignments',
    },
    {
      id: 4,
      name: 'Operation with a reporting window, and operation assignments',
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
    {
      id: 14,
      operationId: 3,
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
        operations: [1, 2, 3, 4],
      },
      assignments: [
        {
          id: 9932,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
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
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
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
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
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
        {
          id: 5927,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operation',
            operationId: 4,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5928,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operationCluster',
            clusterId: 14,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
      ],
    },
    {
      id: 1,
      name: 'Another Reporting Window',
      state: 'pending',
      associations: {
        operations: [2, 4],
      },
      assignments: [],
    },
    {
      id: 2,
      name: 'Closed Reporting Window',
      state: 'closed',
      associations: {
        operations: [2, 4],
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

// Add access to all things
for (const op of INITIAL_DATA.operations) {
  INITIAL_DATA.access.active.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    grantee: {
      type: 'user',
      id: 0,
    },
    roles: ['operationLead'],
  });
  INITIAL_DATA.access.active.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    grantee: {
      type: 'user',
      id: 1,
    },
    roles: ['operationLead'],
  });
  INITIAL_DATA.access.invites.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    email: 'alex@example.com',
    roles: ['operationLead'],
    lastModifiedBy: 1,
  });
  INITIAL_DATA.access.auditLog.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    grantee: {
      type: 'user',
      id: 1,
    },
    roles: ['operationLead'],
    actor: 0,
    date: Date.now(),
  });
}
