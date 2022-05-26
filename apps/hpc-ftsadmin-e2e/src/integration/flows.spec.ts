describe('flows', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('Admin User');
  });

  it('displays the flows data', () => {
    cy.get('[data-test="flows-table-id"]').first().should('have.text', '1 v1');
    cy.get('[data-test="flows-table-updated"]')
      .first()
      .should('have.text', '17/02/2022');
    cy.get('[data-test="flows-table-external-reference"]')
      .first()
      .should('have.text', '--');
    cy.get('[data-test="flows-table-amount-usd"]')
      .first()
      .should('have.text', '$20,200,000');
    cy.get('[data-test="flows-table-source-organization"]')
      .first()
      .should('have.text', 'United States of America, Government of');
    cy.get('[data-test="flows-table-destination-organization"]')
      .first()
      .should('have.text', 'World Food Programme');
    cy.get('[data-test="flows-table-plans"]').first().should('have.text', '--');
    cy.get('[data-test="flows-table-locations"]')
      .first()
      .should('have.text', 'Occupied Palestinian territory');
    cy.get('[data-test="flows-table-years"]')
      .first()
      .should('have.text', '2021');
    cy.get('[data-test="flows-table-details"]')
      .first()
      .should('contain.text', 'paid')
      .and('contain.text', 'parent');
    cy.get('[data-test="flows-table-details"]')
      .eq(1)
      .should('contain.text', 'paid')
      .and('contain.text', 'child')
      .and('not.contain.text', 'parent');
  });
});
