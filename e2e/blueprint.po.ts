import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import { PageHelper } from './page-helper.po';

export class BlueprintPAge extends PageHelper {

  getCreateBlueprintButton () {
    element(by.css('a#blueprint')).click();
    browser.sleep(2000);
    element(by.css('body app-root div blueprints div div.cdm-title div a:nth-child(1)')).click();
  }
  clickSaveBlueprint () {
    return this.findElementAndWait('blueprint-form form div button.mat-raised-button.mat-button-base.mat-warn').click();
  }

  async fillInBlueprintSection (data) {
    browser.waitForAngularEnabled(false);
    const blueprintTypeOptionField = element(by.css('#blueprintTypeOptions'));
    browser.wait(EC.presenceOf(blueprintTypeOptionField), 5000, 'wait for blueprintTypeOptions select');
    blueprintTypeOptionField.click();

    const nameField = element(by.css('#name'));
    browser.wait(EC.presenceOf(nameField), 5000, 'wait for name input');
    nameField.clear().then(function() {
      nameField.sendKeys(data.name);
    })

    const descriptionField = element(by.css('#description'));
    browser.wait(EC.presenceOf(descriptionField), 5000, 'wait for description input');
    descriptionField.clear().then(function() {
      descriptionField.sendKeys(data.description);
    })
    this.clickSaveBlueprint();
    browser.driver.sleep(5000);
  }
  getEditBlueprintButton() {
    browser.driver.sleep(5000);
    return element(by.css('blueprints div table tbody tr:nth-child(1) td.blueprint-block a.edit-blueprint')).click();
  }

  getCloneBlueprintButton() {
    return element(by.css('blueprints div table tbody tr:nth-child(1) td.blueprint-block a.clone-blueprint')).click();
  }
  getRemoveBlueprintButton() {
    element(by.css('blueprints div table tbody tr:nth-child(1) td.blueprint-block a.remove-blueprint')).click();
    return element(by.css('div.swal2-container.swal2-center.swal2-backdrop-show  div  div.swal2-actions  button.swal2-confirm.swal2-styled')).click();
  }
}
