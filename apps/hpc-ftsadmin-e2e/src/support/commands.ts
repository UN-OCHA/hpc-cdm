// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { DummyData } from '@unocha/hpc-dummy';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      login(username: string): void;
      getDummyData(): DummyData;
      typedGet(dataTest: DataTest): Cypress.Chainable<JQuery<HTMLElement>>;
    }
  }
}

const STORAGE_KEY = 'hpc-dummy';

const getData = (): DummyData => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    throw new Error(
      `Could not find dummy data in local storage: ${STORAGE_KEY}`
    );
  }

  return JSON.parse(data);
};

Cypress.Commands.add('getDummyData', () => {
  return getData();
});

/* Login takes a username from the dummy data
 * libs/hpc-dummy/src/lib/dummy.ts
 * and logs in as that user
 */
Cypress.Commands.add('login', (username: string) => {
  const parsedData = getData();
  const userIds = parsedData.users
    .filter((storedUser) => storedUser.user.name === username)
    .map((user) => user.id);

  if (userIds.length > 1) {
    throw new Error(`Multiple users exist with the name ${username}`);
  }

  if (userIds.length === 0) {
    throw new Error(`Could not find user with the name ${username}`);
  }

  const dataWithUser = { ...parsedData, currentUser: userIds[0] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithUser));
});

/*
 * When removing data-test properties from code,
 * please also remove it from here
 */
export type DataTest =
  | 'flows-nav-button'
  | 'flows-table'
  | 'flows-table-checkbox'
  | 'flows-table-id'
  | 'flows-table-status'
  | 'flows-table-updated'
  | 'flows-table-external-reference'
  | 'flows-table-amount-usd'
  | 'flows-table-source-organization'
  | 'flows-table-destination-organization'
  | 'flows-table-plans'
  | 'flows-table-locations'
  | 'flows-table-years'
  | 'flows-table-details'
  | 'flows-table-newMoney'
  | 'flows-table-decisionDate'
  | 'flows-table-exchangeRate'
  | 'flows-table-flowDate'
  | 'flows-table-sourceSystemId'
  | 'flows-table-reporterRefCode'
  | 'flows-table-exchangeRate'
  | 'flows-table-pagination'
  | `flows-table-row-${number}v${number}` // flow.id v flow.versionID
  | `flows-table-header-${string}` // TableHeadersProps<FlowHeaderID>.label as value
  | 'pending-flows-nav-button'
  | 'pending-flows-bulk-reject-button'
  | 'keywords-nav-button'
  | 'keywords-table-id'
  | 'keywords-table-name'
  | 'keywords-table-relatedFlows'
  | 'keywords-table-public'
  | `keywords-table-row-${number}` // keyword.id
  | `keywords-table-header-${string}` // TableHeadersProps<KeywordHeaderID>.label as value
  | 'organizations-nav-button'
  | 'organizations-table-id'
  | 'organizations-table-name'
  | 'organizations-table-abbreviation'
  | 'organizations-table-type'
  | 'organizations-table-subType'
  | 'organizations-table-location'
  | 'organizations-table-created-by'
  | 'organizations-table-updated-by'
  | `keywords-table-row-${number}` // organization.id
  | `organizations-table-header-${string}` // TableHeadersProps<OrganizationHeaderID>.label as value
  | 'organizations-table-pagination';

/*
 * Command that makes the same as cy.get()
 * but we use it for known elements.
 *
 * Ex: <div data-test="test"> test </div>
 * Our type for dataTest will define "test" as a possible value
 */
Cypress.Commands.add('typedGet', (dataTest: DataTest) => {
  return cy.get(`[data-test="${dataTest}"]`);
});
