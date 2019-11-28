import { getGreeting } from '../support/app.po';

describe('cdm', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to cdm!');
  });
});
