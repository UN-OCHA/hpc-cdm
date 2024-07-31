describe('hpc-ftsadmin', () => {
  beforeEach(() => cy.visit('/'));

  it('redirects to /flows when logged in', () => {
    cy.login('Admin User');
    cy.visit('/');
    cy.location('pathname', { timeout: 2000 }).should('eq', '/flows');
  });

  it("doesn't redirect if not logged in", () => {
    cy.location('pathname').should('not.eq', '/flows');
  });
});
