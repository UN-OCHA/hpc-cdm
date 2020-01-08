import { BlueprintPAge } from './blueprint.po';
import { SessionPage } from './session.po';
import { browser, ExpectedConditions as EC } from 'protractor';

describe('CDM Project Start', () => {
  let blueprint: BlueprintPAge;
  let session: SessionPage;
  const cdmData = {
    blueprintInfo: {
      buleprintType: 2,
      name: 'Test blueprint',
      description: 'e2e test blueprint',
    },
    blueprintEditInfo: {
      buleprintType: 2,
      name: 'Test blueprint edit',
      description: 'e2e test blueprint edit',
    }
  };

  beforeAll(() => {
    blueprint = new BlueprintPAge();
    session = new SessionPage();
    session.navigateTo();
    session.logUserIn();
    expect<any>(session.getTitleText()).toContain('0.1.0');
  });
  describe('Blueprint Module Start', () => {
    it('Creating blueprint', () => {
        blueprint.getCreateBlueprintButton();
        blueprint.fillInBlueprintSection(cdmData.blueprintInfo).then(async result => {
            browser.wait(EC.urlContains('blueprints'), 5000, 'Should redirect to blueprints');
            browser.driver.sleep(15000);
        });
    });

    it('Edit blueprint', () => {
      blueprint.getEditBlueprintButton();
      blueprint.fillInBlueprintSection(cdmData.blueprintEditInfo).then(async result => {
          browser.wait(EC.urlContains('blueprints'), 5000, 'Should redirect to blueprints');
          browser.driver.sleep(5000);
      });
    });

    it('Removing blueprint from list', () => {
      blueprint.getRemoveBlueprintButton();
      browser.driver.sleep(5000);
    });

  });
  afterAll(() => {
    session.logUserOut();
    browser.driver.sleep(5000);
  });
});
