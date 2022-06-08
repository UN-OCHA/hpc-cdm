describe('hpc-cdm', () => {
  beforeEach(() => cy.visit('/'));

  it('redirects to /operations when logged in', () => {
    cy.login('Admin User');
    cy.url().should('include', '/operations');
  });

  it("doesn't redirect if not logged in", () => {
    cy.url().should('not.include', '/operations');
  });
});
