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

  describe('sorting', () => {
    it('is inititally sorted by updated/created descending', () => {
      cy.get('[data-test="header-updatedCreated"]').should(
        'have.attr',
        'aria-sort',
        'descending'
      );
      cy.get('[data-test="flows-table-id"]')
        .first()
        .should('have.text', '1 v1');
      cy.get('[data-test="header-id"]').should('not.have.attr', 'aria-sort');
    });

    it('one click triggers sorting descending', () => {
      cy.get('[data-test="header-id"]').click();

      cy.get('[data-test="header-id"]').should(
        'have.attr',
        'aria-sort',
        'descending'
      );
      cy.get('[data-test="flows-table-id"]')
        .first()
        .should('have.text', '3 v1');
    });

    it('two clicks triggers sorting ascending', () => {
      cy.get('[data-test="header-id"]').click();
      cy.get('[data-test="header-id"]').click();

      cy.get('[data-test="header-id"]').should(
        'have.attr',
        'aria-sort',
        'ascending'
      );
      cy.get('[data-test="flows-table-id"]')
        .first()
        .should('have.text', '1 v1');
    });

    it('can switch to sorting by a different property', () => {
      cy.get('[data-test="header-id"]').click();
      cy.get('[data-test="header-sourceOrganization"]').click();

      cy.get('[data-test="header-sourceOrganization"]').should(
        'have.attr',
        'aria-sort',
        'descending'
      );
      cy.get('[data-test="header-id"]').should('not.have.attr', 'aria-sort');
      cy.get('[data-test="flows-table-id"]')
        .first()
        .should('have.text', '3 v1');
    });
  });

  describe('query strings', () => {
    it('updates query string on sort', () => {
      cy.get('[data-test="header-id"]').click();
      cy.location('search').should('include', 'orderBy=flow.id&orderDir=DESC');
    });

    it('updates query string on changing pagination', () => {
      cy.get(
        '[data-test="flows-table-pagination"] .MuiTablePagination-select'
      ).click();
      cy.get('[data-value="10"]').click();
      cy.location('search').should('include', 'rowsPerPage=10');
    });

    it('loads correct settings when visiting from a query string link', () => {
      cy.visit('/flows?orderBy=flow.id&orderDir=DESC&page=0&rowsPerPage=10');
      cy.get('[data-test="header-id"]').should(
        'have.attr',
        'aria-sort',
        'descending'
      );
      cy.get(
        '[data-test="flows-table-pagination"] .MuiTablePagination-select'
      ).should('have.text', '10');
    });
  });
});
