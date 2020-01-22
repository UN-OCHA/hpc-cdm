import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import { PageHelper } from './page-helper.po';

export class ReportingWindowPage extends PageHelper {

  getEditReportingWindowButton () {
    element(by.css('a#reportingWindow')).click();
  }

  getCreateReportingWindowButton () {
    element(by.css('a#reportingWindow')).click();
    browser.sleep(500);
    element(by.css('body  app-root  div  reporting-windows  div  div.cdm-title  div  a:nth-child(1)')).click();
  }
  clickSaveReportingWindow () {
    return this.findElementAndWait('body  app-root  div  reporting-windows  div  div.container  reporting-window-form  form  div.actions  button').click();
  }

  async fillInReportingWindowSection (data) {
    browser.waitForAngularEnabled(false);
    const reportingTypeOptionField = element(by.css('#contextType'));
    browser.wait(EC.presenceOf(reportingTypeOptionField), 5000, 'wait for reportingTypeOptions select');
    reportingTypeOptionField.click();

    const contextInput = element(by.css('#contextInput'));
    browser.wait(EC.presenceOf(contextInput), 5000, 'wait for name input');
    contextInput.clear().then(function() {
      contextInput.sendKeys('dji');
      const autocompleteInput = element(by.css('#mat-option-0'));     
     browser.wait(EC.presenceOf(autocompleteInput), 5000, 'wait for name input');
     autocompleteInput.click();
    })
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
    this.findElementAndWait('body  app-root  div  reporting-windows  div  div.container  reporting-window-form  form  div.reportingPeriod  button:nth-child(2)').click();
    this.clickSaveReportingWindow();
    browser.driver.sleep(5000);
  }
  async fillInReportingWindowEditSection (data) {
    browser.waitForAngularEnabled(false);

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
    this.clickSaveReportingWindow();
    browser.driver.sleep(5000);
  }

  getEditReportingWindowLink() {
    browser.driver.sleep(5000);
    return element(by.css('body  app-root  div  reporting-windows  div  div.container  reporting-windows  div  table  tbody  tr:nth-child(13)  td  div  span  a:nth-child(1)')).click();
  } 
}
