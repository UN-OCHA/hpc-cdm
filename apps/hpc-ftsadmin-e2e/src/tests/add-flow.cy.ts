import * as ADD_FLOW from '../fixtures/add-flow.json';
import { selectOption } from '../support/select-component-utils';

describe('hpc-ftsadmin add-flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('Admin User');
    cy.visit('/');
    cy.location('pathname').should('eq', '/flows');
    cy.typedGet('add-flow-nav-button').click();
    cy.location('pathname').should('eq', '/flow/add');
  });

  it('bulkRejectPendingFlows workflow', () => {
    cy.typedGet('add-flow-source-organization-field').type(
      ADD_FLOW['test1']['add-flow-source-organization-field']
    );
    selectOption(ADD_FLOW['test1']['add-flow-source-organization-field']);

    cy.typedGet('add-flow-source-organization-field').should(
      'contain',
      ADD_FLOW['test1']['add-flow-source-organization-field']
    );
    cy.typedGet('add-flow-source-location-field').should('contain', 'Germany');

    cy.typedGet('add-flow-source-usage-year-field').type(
      ADD_FLOW['test1']['add-flow-source-usage-year-field']
    );
    selectOption(ADD_FLOW['test1']['add-flow-source-usage-year-field']);

    cy.typedGet('add-flow-destination-project-field').type(
      ADD_FLOW['test1']['add-flow-destination-project-field']
    );
    selectOption(ADD_FLOW['test1']['add-flow-destination-project-field']);

    cy.typedGet('add-flow-destination-plan-field').should(
      'contain',
      'Afghanistan 2002 (ITAP for the Afghan People)'
    );
    cy.typedGet('add-flow-destination-global-cluster-field').should(
      'contain',
      'Multi-sector'
    );
    cy.typedGet('add-flow-destination-usage-year-field').should(
      'contain',
      '2022'
    );
    cy.typedGet('add-flow-destination-location-field').should(
      'contain',
      'Afghanistan'
    );
    cy.typedGet('add-flow-destination-organization-field').should(
      'contain',
      "United Nations Children's Fund"
    );

    /*
     * Original Currency related testing
     */

    cy.typedGet('add-flow-original-currency-dropdown').click();

    cy.typedGet('add-flow-original-currency-funding-amount-field').type(
      ADD_FLOW['test1']['add-flow-original-currency-funding-amount-field']
    );
    cy.typedGet('add-flow-original-currency-field').click();
    selectOption('LAK');

    cy.typedGet('add-flow-exchange-rate-field').type(
      ADD_FLOW['test1']['add-flow-exchange-rate-field']
    );

    cy.typedGet('add-flow-original-currency-button').should(
      'contain.text',
      'Calculate the funding amount in USD'
    );
    cy.typedGet('add-flow-original-currency-funding-amount-field').clear();

    cy.typedGet('add-flow-amount-USD-field').type(
      ADD_FLOW['test1']['add-flow-amount-USD-field']
    );

    cy.typedGet('add-flow-original-currency-button').should(
      'contain.text',
      'Calculate funding amount in its original currency'
    );

    cy.typedGet('add-flow-exchange-rate-field').clear();
    cy.typedGet('add-flow-original-currency-funding-amount-field').type(
      ADD_FLOW['test1']['add-flow-original-currency-funding-amount-field']
    );

    cy.typedGet('add-flow-original-currency-button').should(
      'contain.text',
      'Calculate the exchange rate'
    );

    cy.typedGet('add-flow-original-currency-button').should(
      'contain.text',
      'Calculate the exchange rate'
    );
    /*
     * --------------------------------------------------------
     */

    cy.typedGet('add-flow-description-field').type(
      ADD_FLOW['test1']['add-flow-description-field']
    );

    const date = new Date().toLocaleDateString('en-GB');
    cy.typedGet('add-flow-first-reported-field').type(date);
    cy.typedGet('add-flow-decision-date-field').type(date);

    cy.typedGet('add-flow-flow-status-field').click();
    selectOption('Commitment');

    cy.typedGet('add-flow-flow-date-field').type(date);

    // Properly write
    cy.typedGet('add-flow-reported-by-organization-options').click();

    cy.typedGet('add-flow-reported-channel-field').click();
    selectOption('Fax');

    cy.typedGet('add-flow-date-reported-field').should('contain', date);

    cy.typedGet('add-flow-create-button').click();

    cy.typedGet('add-flow-copy-button').click();

    cy.typedGet('add-flow-title').should('contain', 'Copy');

    cy.typedGet('add-flow-add-parent-flow-button').click();

    // TODO: Get previous flow ID
    cy.typedGet('add-flow-add-parent-flow-field').type('PREVIOUS FLOW ID');
    selectOption('PREVIOUS FLOW ID');

    cy.typedGet('add-flow-add-parent-flow-submit-button').click();

    cy.typedGet('add-flow-parent-flow-table').should('exist');
  });

  /**
   * TODO: Add more checking to the test once edit flow is in the app
   */
  it('Enter pending-flow', () => {
    cy.typedGet('flows-table-row-305776v1').click();
    cy.location('pathname').should('eq', '/flows/305776');
  });
});
