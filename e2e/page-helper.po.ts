import { browser, by, element, ExpectedConditions as EC, Key } from 'protractor';

export class PageHelper {
  navigateTo(to = '/') {
    return browser.get(to);
  }

  waitForElement(el, waitText?) {
    return browser.wait(EC.and(
      EC.presenceOf(el),
      EC.visibilityOf(el)
    ), 10000, waitText || 'Waiting for element');
  }

  findElementAndWait (elCSS, elText?) {
    browser.sleep(300); // ugh
    let el;
    if (elText) {
      el = element(by.cssContainingText(elCSS, elText));
    } else {
      el = element(by.css(elCSS));
    }

    this.waitForElement(el, `wait for ${elCSS} ${elText ? elText : ''}`)

    return el;
  }

  scrollTo (el) {
    browser.executeScript('arguments[0].scrollIntoView()', el.getWebElement());
  }

  getNavigationAlert () {
    browser.wait(EC.alertIsPresent(), 5000, 'Waiting for alert telling us to navigate away');
    browser.switchTo().alert().accept();
  }

  async getErrorMessage (timeout = 5000) {
    const errTitle = element(by.css('.toast-title'));
    browser.wait(EC.presenceOf(errTitle), timeout);
    const title = await errTitle.getText();
    const message = {title: title};
    return element(by.css('.toast-message')).getText().then(msg => {
      message['text'] = msg;
      element(by.css('.toast-close-button')).click();
      return message;
    });
  }

  getSuccessMessage (timeout = 5000) {
    const errTitle = element(by.css('.toast-message'));
    browser.wait(EC.presenceOf(errTitle), timeout);
    return errTitle.getText().then(text => {
      element(by.css('.toast-close-button')).click();
      return {text: text};
    });
  }

  getWarningMessage (timeout = 5000) {
    const errTitle = element(by.css('.toast-message'));
    browser.wait(EC.presenceOf(errTitle), timeout);
    return errTitle.getText().then(text => {
      element(by.css('.toast-close-button')).click();
      return {text: text};
    });
  }

  selectDropdownByNumber (elm, index, milliseconds) {
    elm.findElements(by.tagName('option'))
      .then((options) => {
        options[index].click();
      });
    if (typeof milliseconds !== 'undefined') {
      browser.sleep(milliseconds);
    }
  }

  selectDropdownByText (elm, text) {
    elm.all(by.css('option')).then(options => {
      options.forEach(opt => {
        opt.getText().then(optText => {
          if (optText.trim() === text) {
            opt.click();
          }
        });
      });
    });
  }

  fillInTextInInputField (elm, text) {
    elm.sendKeys(Key.chord(Key.CONTROL, 'a'), text);
  }
}
