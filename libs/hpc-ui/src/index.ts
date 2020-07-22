import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, Theme } from './lib/theme';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import Header from './lib/components/header';
import Tabs from './lib/components/tabs';

const COMPONENTS = {
  AcceptableUseNotification,
  Header,
  Tabs,
};

export {
  BaseStyling,
  CLASSES,
  combineClasses,
  COMPONENTS as C,
  css,
  styled,
  THEME,
  Theme,
};
