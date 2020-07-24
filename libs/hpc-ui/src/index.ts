import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, Theme, ThemeProvider } from './lib/theme';
import { DataLoaderState, dataLoader } from './lib/util';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import Breadcrumbs from './lib/components/breadcrumbs';
import Loader from './lib/components/loader';
import Header from './lib/components/header';
import Tabs from './lib/components/tabs';
import Toolbar from './lib/components/toolbar';

const COMPONENTS = {
  AcceptableUseNotification,
  Breadcrumbs,
  Loader,
  Header,
  Tabs,
  Toolbar,
};

export {
  BaseStyling,
  CLASSES,
  combineClasses,
  COMPONENTS as C,
  css,
  DataLoaderState,
  dataLoader,
  styled,
  THEME,
  Theme,
  ThemeProvider,
};
