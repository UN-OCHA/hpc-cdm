describe('hpc-ftsadmin pending-flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('Admin User');
    cy.visit('/');
    cy.location('pathname').should('eq', '/flows');
    cy.typedGet('pending-flows-nav-button').click();
    cy.location('pathname').should('eq', '/pending-flows');
  });

  it('bulkRejectPendingFlows workflow', () => {
    cy.typedGet('flows-table')
      .find('input[type="checkbox"]')
      .each(($checkbox) => {
        cy.wrap($checkbox).click();
      });

    cy.typedGet('pending-flows-bulk-reject-button').click();
    cy.contains('No results found');
    cy.typedGet('flows-table').should('not.exist');
  });

  /**
   * TODO: Add more checking to the test once edit flow is in the app
   */
  it('Enter pending-flow', () => {
    cy.typedGet('flows-table-row-305776v1').click();
    cy.location('pathname').should('eq', '/flows/305776');
  });
});
