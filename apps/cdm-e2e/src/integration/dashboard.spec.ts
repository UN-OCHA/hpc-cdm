import { login } from '../support/app.po';

describe('cdm dashboard', () => {
  const username = 'alex@example.com';
  const password = 'test';

  beforeEach(() => {
    login(username, password);
  });

  it('should display dashboard components', () => {
    cy.url().should('include', '/dashboard');
    cy.get('.app-links > a:first-child').contains('Operations');
  });
});
