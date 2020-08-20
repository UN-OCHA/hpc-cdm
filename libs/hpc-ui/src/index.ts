import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, Theme, ThemeProvider } from './lib/theme';
import { DataLoaderState, dataLoader } from './lib/util';
import * as mixins from './lib/mixins';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import Breadcrumbs, { BreadcrumbLinks } from './lib/components/breadcrumbs';
import ErrorMessage from './lib/components/error-message';
import Header from './lib/components/header';
import Loader from './lib/components/loader';
import NotFound from './lib/components/not-found';
import SidebarNavigation from './lib/components/sidebar-navigation';
import Tabs from './lib/components/tabs';
import Toolbar from './lib/components/toolbar';

import Caret from './lib/icons/caret';

const COMPONENTS = {
  AcceptableUseNotification,
  Breadcrumbs,
  ErrorMessage,
  Header,
  Loader,
  NotFound,
  SidebarNavigation,
  Tabs,
  Toolbar,
};

const ICONS = {
  Caret,
};

export {
  BaseStyling,
  BreadcrumbLinks,
  CLASSES,
  combineClasses,
  COMPONENTS as C,
  css,
  DataLoaderState,
  dataLoader,
  ICONS,
  mixins,
  styled,
  THEME,
  Theme,
  ThemeProvider,
};
