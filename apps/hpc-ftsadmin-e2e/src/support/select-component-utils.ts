export const selectOption = (option: string) => {
  cy.contains('li', option).click();
};
