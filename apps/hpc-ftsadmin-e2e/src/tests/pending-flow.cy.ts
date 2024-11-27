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

  it('Enter pending-flow', () => {
    cy.typedGet('flows-table-row-328879v1').find('a').click();
    cy.location('pathname').should('eq', '/flows/328879/1');
    cy.get('span')
      .contains(
        'This flow is not active because it has been marked as Pending review'
      )
      .should('exist');

    cy.typedGet('pending-flows-popup').should('have.length', 4);
  });
});
