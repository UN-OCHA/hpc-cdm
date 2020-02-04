import { BlueprintPAge } from './blueprint.po';
import { PrototypePage } from './prototypes.po';
import { SessionPage } from './session.po';
import { browser, ExpectedConditions as EC } from 'protractor';

describe('CDM Project Start', () => {
  let blueprint: BlueprintPAge;
  let prototype: PrototypePage;
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
    },
    OperationAttachmentPrototypeInfo: {
      refCode: 'IN',
      refType: 'indicator',
      jsonModel: '{"hasMeasures":0,"min":0,"max":1,"name":{"en":"Text Web Content"},"entities":["SO","SSO","CL","CO","CA"]}',
    },
    OperationAttachmentPrototypeEditInfo: {
      refCode: 'IN edit',
      refType: 'indicator  edit',
      jsonModel: '"min": 1,',
    },
    OperationEntityPrototypeInfo: {
      refCode: 'IN',
      refType: 'indicator',
      jsonModel: '{"name":{"en":{"singular":"Output","plural":"Outputs"}},"description":{"en":"Adding Cluster activities."},"canSupport":{"xor":[{"refCode":"SO","cardinality":"0-N"},{"refCode":"CO","cardinality":"0-N"}]}}',
    },
    OperationEntityPrototypeEditInfo: {
      refCode: 'IN edit',
      refType: 'indicator  edit',
      jsonModel: '',
    },

  };

  beforeAll(() => {
    blueprint = new BlueprintPAge();
    prototype = new PrototypePage();
    session = new SessionPage();
    session.navigateTo();
    session.logUserIn();
    expect<any>(session.getTitleText()).toContain('0.1.0');
  });
  describe('Operation Prototypes Start', () => {
       it('Creating attachmentprototype', () => {
          prototype.getAttachmentPrototypePage();
          browser.driver.sleep(5000);
          prototype.getCreateButton();
          prototype.fillInPrototypeSection(cdmData.OperationAttachmentPrototypeInfo).then(async result => {
              browser.wait(EC.urlContains('operations'), 5000, 'Should redirect to operations');
              browser.driver.sleep(5000);
          });
        })
      it('Edit attachmentprototype', () => {
          prototype.getAttachmentPrototypeEditButton();
          prototype.fillInPrototypeSection(cdmData.OperationAttachmentPrototypeEditInfo).then(async result => {
              browser.wait(EC.urlContains('operations'), 5000, 'Should redirect to operations');
              browser.driver.sleep(5000);
          });
        });
      it('Removing attachmentprototype from list', () => {
        prototype.getRemoveAttachmentPrototypeButton();
        browser.driver.sleep(5000);
      });
      /********************************************** */
      it('Creating entityprototype', () => {
        prototype.getEntityPrototypePage();
        browser.driver.sleep(5000);
        prototype.getCreateButton();
        prototype.fillInPrototypeSection(cdmData.OperationEntityPrototypeInfo).then(async result => {
            browser.wait(EC.urlContains('operations'), 5000, 'Should redirect to operations');
            browser.driver.sleep(5000);
        });
      })
    it('Edit entityprototype', () => {
        prototype.getEntityPrototypeEditButton();
        prototype.fillInPrototypeSection(cdmData.OperationEntityPrototypeEditInfo).then(async result => {
            browser.wait(EC.urlContains('operations'), 5000, 'Should redirect to operations');
            browser.driver.sleep(5000);
        });
      });
    it('Removing entityprototype from list', () => {
      prototype.getRemoveEntityPrototypeButton();
      browser.driver.sleep(5000);
    });
  });

  describe('Blueprint Module Start', () => {
    it('Creating blueprint', () => {
        blueprint.getCreateBlueprintButton();
        blueprint.fillInBlueprintSection(cdmData.blueprintInfo).then(async result => {
            browser.wait(EC.urlContains('blueprints'), 5000, 'Should redirect to blueprints');
            browser.driver.sleep(5000);
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
