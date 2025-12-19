import * as dayjs from 'dayjs';
import * as ADD_FLOW from '../fixtures/add-flow.json';
import { selectOption } from '../support/select-component-utils';

describe('hpc-ftsadmin add-flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('Admin User');
    cy.visit('/');
    cy.location('pathname').should('eq', '/flows');
    cy.typedGet('add-flow-nav-button').click();
    cy.location('pathname').should('eq', '/flows/add');
  });

  it('Add flow', () => {
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
      'contain.html',
      'Afghanistan 2002 (ITAP for the Afghan People)'
    );
    cy.typedGet('add-flow-destination-global-cluster-field').should(
      'contain',
      'Multi-sector'
    );
    cy.typedGet('add-flow-destination-usage-year-field').should(
      'contain',
      '2002'
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

    cy.typedGet('add-flow-original-currency-funding-amount-field').type(
      ADD_FLOW['test1']['add-flow-original-currency-funding-amount-field']
    );
    cy.typedGet('add-flow-original-currency-field').click();
    selectOption('EUR');

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

    const date = dayjs().format('DD/MM/YYYY');
    cy.typedGet('add-flow-first-reported-today').click();
    cy.typedGet('add-flow-decision-date-today').click();

    cy.typedGet('add-flow-flow-status-field').click();
    selectOption('Commitment');

    cy.typedGet('add-flow-flow-date-today').click();

    cy.typedGet(
      'add-flow-reported-by-organization-0-options-destination-0'
    ).click();

    cy.typedGet('add-flow-reported-channel-field-0').click();
    selectOption('Fax');

    cy.typedGet('add-flow-date-reported-field-0').should('contain.html', date);

    cy.typedGet('add-flow-create-button').click();

    //  Due to toast appearing on top, we have to force
    cy.typedGet('add-flow-copy-button').click({ force: true });

    cy.typedGet('add-flow-title').should('contain', 'Copy');

    cy.typedGet('add-flow-add-parent-flow-button').click();

    // Flow 316064 is part of mocked data
    cy.typedGet('add-flow-add-parent-flow-field').type('316064');
    selectOption('316064');

    cy.typedGet('add-flow-add-parent-flow-submit-button').click();

    cy.typedGet('add-flow-parent-flow-table').should('exist');

    //  Verify source data gets updated when
    //  a parent flow is selected
    cy.typedGet('add-flow-readonly-source-organization-field').should(
      'contain',
      'United States of America, Government of [USA]'
    );
    cy.typedGet('add-flow-readonly-source-usage-year-field').should(
      'contain',
      '2023'
    );
    cy.typedGet('add-flow-readonly-source-location-field').should(
      'contain',
      'United States'
    );
  });
});
