import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, Theme, ThemeProvider } from './lib/theme';
import { DataLoaderState, dataLoader } from './lib/util';
import * as mixins from './lib/mixins';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import Breadcrumbs, { BreadcrumbLinks } from './lib/components/breadcrumbs';
import DevEnvWarning from './lib/components/development-environment-warning';
import ErrorMessage from './lib/components/error-message';
import Header from './lib/components/header';
import Loader from './lib/components/loader';
import MainNavigation from './lib/components/main-navigation';
import NotFound from './lib/components/not-found';
import SidebarNavigation from './lib/components/sidebar-navigation';
import Tabs from './lib/components/tabs';
import Toolbar from './lib/components/toolbar';

import Caret from './lib/assets/icons/caret';

const COMPONENTS = {
  AcceptableUseNotification,
  Breadcrumbs,
  DevEnvWarning,
  ErrorMessage,
  Header,
  Loader,
  MainNavigation,
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
