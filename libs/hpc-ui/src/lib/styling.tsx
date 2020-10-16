import { createGlobalStyle } from 'styled-components';

import { CLASSES } from './classes';
import { Theme } from './theme';

export const BaseStyling = createGlobalStyle<{ theme: Theme }>`
body, html {
  margin: 0;
  padding: 0;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: ${(p) => p.theme.colors.text};
}

html {
  // Reset 1 rem to be 10px on most browsers
  font-size: 62.5%;
}

body {
  // Set default font-size to be 14px;
  font-size: 1.4rem;
}

.${CLASSES.CONTAINER.CENTERED} {
  padding-left: ${(p) => p.theme.marginPx.md}px;
  padding-right: ${(p) => p.theme.marginPx.md}px;
  margin-left: auto;
  margin-right: auto;
  max-width: ${(p) => p.theme.sizing.containerWidthPx}px;
}

.${CLASSES.CONTAINER.FLUID} {
  padding-left: ${(p) => p.theme.marginPx.md}px;
  padding-right: ${(p) => p.theme.marginPx.md}px;
  margin-left: 0;
  margin-right: 0;
}

.${CLASSES.FLEX.CONTAINER} {
  display: flex;
  align-items: center;
}

.${CLASSES.FLEX.GROW} {
  flex-grow: 1;
}

a {
  color: ${(p) => p.theme.colors.textLink};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}



`;
