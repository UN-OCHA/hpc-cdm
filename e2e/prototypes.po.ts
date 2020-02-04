import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import { PageHelper } from './page-helper.po';

export class PrototypePage extends PageHelper {

  getOperationPage () {
    element(by.css('a#operations')).click();
    browser.sleep(200);
  }
  getOperationButton () {
    element(by.css('operation-list table tbody tr:nth-child(1) td div div.actions > mat-icon')).click();
    browser.sleep(200);
  }
  getAttachmentPrototypePage() {
    browser.waitForAngularEnabled(false);
    this.getOperationPage();
    this.getOperationButton();
    browser.actions().mouseMove(element(by.css('operation-list table tbody tr:nth-child(2)  td div div operation-menu div div:nth-child(3) button'))).perform();
    //Click on the element that appeared after hover over the electronics
    element(by.css('.cdk-overlay-connected-position-bounding-box div div span a:nth-child(1)')).click();
    browser.sleep(200);
  }
  getEntityPrototypePage() {
    browser.waitForAngularEnabled(false);
    browser.actions().mouseMove(element(by.css('operation-menu div div:nth-child(3) button'))).perform();
    //Click on the element that appeared after hover over the electronics
    element(by.css('.cdk-overlay-connected-position-bounding-box div div span a:nth-child(2)')).click();
    browser.sleep(200);
  }

  getCreateButton () {
    element(by.css('body app-root div  div div.cdm-title div a:nth-child(1)')).click();
    browser.sleep(500);
  }

  clickSaveButton () {
    return this.findElementAndWait('form div button.mat-raised-button.mat-button-base.mat-warn').click();
  }

  async fillInPrototypeSection (data) {
    browser.waitForAngularEnabled(false);
     const refCodeField = element(by.css('#refCode'));
    browser.wait(EC.presenceOf(refCodeField), 5000, 'wait for refCode input');
    refCodeField.clear().then(function() {
      refCodeField.sendKeys(data.refCode);
    })

    const refTypeField = element(by.css('#refType'));
    browser.wait(EC.presenceOf(refTypeField), 5000, 'wait for refType input');
    refTypeField.clear().then(function() {
      refTypeField.sendKeys(data.refType);
    })

    const divInput = element(by.css('div.ace_content'));
    browser.actions().doubleClick(divInput).perform();

    const jsonModel = element(by.css('.ace_text-input'));
    browser.wait(EC.presenceOf(jsonModel), 5000, 'wait for jsonModel');
    jsonModel.clear().then(function() {
      jsonModel.sendKeys(data.jsonModel);
    })

    this.clickSaveButton();
    browser.driver.sleep(5000);
  }


  getAttachmentPrototypeEditButton() {
    browser.driver.sleep(5000);
    return element(by.css('attachment-prototypes div table tbody tr td.mat-cell.cdk-column-action.mat-column-action.ng-star-inserted div a.mat-button.mat-icon-button.mat-button-base.mat-primary')).click();
  }
  getRemoveAttachmentPrototypeButton() {
    element(by.css('attachment-prototypes div table tbody tr td.mat-cell.cdk-column-action.mat-column-action.ng-star-inserted div a.mat-button.mat-icon-button.mat-button-base.mat-warn span mat-icon')).click();
    return element(by.css('div.swal2-container.swal2-center.swal2-backdrop-show  div  div.swal2-actions  button.swal2-confirm.swal2-styled')).click();
  }
  getEntityPrototypeEditButton() {
    browser.driver.sleep(5000);
    return element(by.css('entity-prototypes div.container entity-prototypes div table tbody tr td.mat-cell.cdk-column-action.mat-column-action.ng-star-inserted div a.mat-button.mat-icon-button.mat-button-base.mat-primary')).click();
  }
  getRemoveEntityPrototypeButton() {
    element(by.css('entity-prototypes div.container entity-prototypes div table tbody tr td.mat-cell.cdk-column-action.mat-column-action.ng-star-inserted div a.mat-button.mat-icon-button.mat-button-base.mat-warn')).click();
    return element(by.css('div.swal2-container.swal2-center.swal2-backdrop-show  div  div.swal2-actions  button.swal2-confirm.swal2-styled')).click();
  }
}
