import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, Theme } from './lib/theme';
import { DataLoaderState, dataLoader, simpleDataLoader } from './lib/util';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import Loader from './lib/components/loader';
import Header from './lib/components/header';
import Tabs from './lib/components/tabs';

const COMPONENTS = {
  AcceptableUseNotification,
  Loader,
  Header,
  Tabs,
};

export {
  BaseStyling,
  CLASSES,
  combineClasses,
  COMPONENTS as C,
  css,
  DataLoaderState,
  dataLoader,
  simpleDataLoader,
  styled,
  THEME,
  Theme,
};
