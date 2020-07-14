import { createGlobalStyle } from 'styled-components';

import { CLASSES } from './classes';
import * as mixins from './mixins';

export const BaseStyling = createGlobalStyle`
body, html {
  margin: 0;
  padding: 0;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #4a4a4a;
}

.${CLASSES.CONTAINER.CENTERED} {
  padding-left: 15px;
  padding-right: 15px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1240px;
}

.${CLASSES.CONTAINER.FLUID} {
  padding-left: 15px;
  padding-right: 15px;
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

.${CLASSES.BUTTON.PRIMARY} {
  ${mixins.button}
  ${mixins.buttonPrimary}
}

.${CLASSES.BUTTON.CLEAR} {
  ${mixins.button}
  ${mixins.buttonClear}
}

.${CLASSES.BUTTON.WITH_ICON} {
  ${mixins.buttonWithIcon}
}



`;
