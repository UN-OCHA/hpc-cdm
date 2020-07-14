import { createGlobalStyle } from 'styled-components';

import { CLASSES } from './classes';

export const BaseStyling = createGlobalStyle`
body, html {
  margin: 0;
  padding: 0;
}

.${CLASSES.CONTAINER.FLUID} {
  padding-left: 15px;
  padding-right: 15px;
  margin-left: 0;
  margin-left: 0;
}

.${CLASSES.FLEX.CONTAINER} {
  display: flex;
  align-items: center;
}

.${CLASSES.FLEX.GROW} {
  flex-grow: 1;
}

`;
