import { getGreeting, getLogo, getLanguages,
  getLoginLink, getLoginButton, getHelp, getFeed,
  getAppName } from '../support/app.po';

describe('cdm app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display home components', () => {
    getAppName().contains('Local Coordination Data Module');
    getGreeting().contains('Acceptable Use Notification');
    getLogo().should('exist');
    getLanguages().should('exist');
    getLoginButton().should('exist');
    getLoginLink().should('exist');
    getHelp().should('exist');
    getFeed().should('exist');
  });

  it('should redirect to hid page with login link', () => {
    getLoginLink().click().get('.page-header h1').contains('Log in');
  });

  it('should redirect to hid page with login button', () => {
    getLoginButton().click().get('.page-header h1').contains('Log in');
  });

  it('should show logo menu', () => {
    getLogo().click().get('.mat-menu-content');
    cy.contains('Data Sharing Services').click();
    cy.contains('Humanitarian Data Exchange').should('have.attr', 'href');
  });

  it('should show languages', () => {
    getLanguages().click().get('.mat-menu-content');
    cy.contains('EN');
    cy.contains('FR');
  });

});
