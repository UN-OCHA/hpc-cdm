import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import { PageHelper } from './page-helper.po';

export class OperationAttachmentPage extends PageHelper {

  getOperationPage() {
    element(by.css('a#operations')).click();
    browser.sleep(200);
  }
  getOperationButton() {
    element(by.css('operation-list table tbody tr:nth-child(1) td div div.actions > mat-icon')).click();
    browser.sleep(200);
  }
  getAddOperationAttachmentPage() {
    browser.waitForAngularEnabled(false);
    this.getOperationPage();
    this.getOperationButton();
    browser.actions().mouseMove(element(by.css('operation-list table tbody tr:nth-child(2)  td div div operation-menu div div:nth-child(1) button'))).perform();
    //Click on the element that appeared after hover over the electronics
    element(by.css('.cdk-overlay-connected-position-bounding-box div div span a:nth-child(2)')).click();
    const addPanel = element(by.css("div.panel-attachments  mat-accordion > attachment-entry"));
    browser.wait(EC.visibilityOf(addPanel), 5000, 'wait for add panel')
    addPanel.click()
    browser.sleep(200);  
  }

async fillOperationAttachmentSection(data){
    const formIdfield = element(by.css("div.panel-attachments > mat-accordion > attachment-entry input[formcontrolname='formId']"));
    formIdfield.clear().then(function () {
      formIdfield.sendKeys(data.formId);
    });
    const formNamefield = element(by.css("div.panel-attachments > mat-accordion > attachment-entry input[formcontrolname='formName']"));
    formNamefield.clear().then(function () {
      formNamefield.sendKeys(data.formName);
    });
    const path = require('path');
    let absolutePath = path.resolve(data.formFile);
    const fileElem = element(by.css('#cdk-accordion-child-1 > div > div > file-upload > div > div.form-group input[type="file"]'));
    fileElem.sendKeys(absolutePath);
    browser.sleep(200);
    this.clickSaveOperationAttachment();
    browser.driver.sleep(5000); 
  }
  clickSaveOperationAttachment () {
    return this.findElementAndWait('#cdk-accordion-child-1 div  div  div:nth-child(3)  div  a').click();
  }
}
