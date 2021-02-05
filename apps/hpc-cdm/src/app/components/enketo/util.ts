import * as Bowser from 'bowser';

export const browserSupportedByEnketo = (): boolean => {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const isValidBrowser = browser.satisfies({
    chrome: '>20',
    firefox: '>31',
    edge: '>14',
  });
  return isValidBrowser ? true : false;
};
