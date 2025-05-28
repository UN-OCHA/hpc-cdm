import * as Bowser from 'bowser';

export const browserSupportedByEnketo = (): boolean => {
  const browser = Bowser.getParser(globalThis.navigator.userAgent);
  const isValidBrowser = browser.satisfies({
    chrome: '>20',
    firefox: '>31',
    // Allow chromium-based edge only
    edge: '>79',
  });
  return !!isValidBrowser;
};
