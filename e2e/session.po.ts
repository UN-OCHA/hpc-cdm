import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import { PageHelper } from './page-helper.po';

export class SessionPage extends PageHelper {
  getTitleText () {
    return element(by.css('span.p-4')).getText();
  }

  getLoginMenu () {
    const loginDropdownElement = element(by.css('.login'));
    browser.wait(EC.presenceOf(loginDropdownElement), 5000, 'wait for Login');
    return loginDropdownElement;
  }
  /*
   * Log the user in using the supplied username and password.
   * Defaults to alex & test
   */
  logUserIn (username = 'alex@example.com', password = process.env.HID_PASSWORD || 'test') {
    browser.waitForAngularEnabled(false);
    element(by.css('.simplelink')).click();

    const emailField = element(by.css('input#email'));
    browser.wait(EC.presenceOf(emailField), 5000, 'wait for email input');
    emailField.sendKeys(username);
    element(by.css('input#password')).sendKeys(password);
    element(by.css('button[type=submit].btn-primary')).click();

    return element(by.css('input#allow')).isPresent()
      .then((result) => {
        if (result) {
          return element(by.css('input#allow')).click();
        } else {
          return;
        }
      })
  }

  logUserOut () {
    element(by.css('.signin')).click();
    return element(by.css('#logout')).click();
  }
}
