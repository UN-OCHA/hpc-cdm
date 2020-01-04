import { getGreeting } from "../support/app.po";

describe("example", () => {
  beforeEach(() => cy.visit("/"));

  it("should display welcome message", () => {
    getGreeting().contains("Welcome to example!");
  });
});
