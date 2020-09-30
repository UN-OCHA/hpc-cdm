import * as Bowser from 'bowser';

export const supportedBrowser = (): boolean => {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const isValidBrowser = browser.satisfies({
    chrome: '>20',
    firefox: '>31',
  });
  return isValidBrowser ? true : false;
};
