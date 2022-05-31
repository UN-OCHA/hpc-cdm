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
