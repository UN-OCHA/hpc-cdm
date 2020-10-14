import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, Theme, ThemeProvider } from './lib/theme';
import { DataLoaderState, dataLoader } from './lib/util';
import * as mixins from './lib/mixins';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import DevEnvWarning from './lib/components/development-environment-warning';
import ErrorMessage from './lib/components/error-message';
import Header from './lib/components/header';
import List from './lib/components/list';
import ListItem from './lib/components/list-item';
import Loader from './lib/components/loader';
import MainNavigation from './lib/components/main-navigation';
import NotFound from './lib/components/not-found';
import PageTitle from './lib/components/page-title';
import SidebarNavigation from './lib/components/sidebar-navigation';
import SecondaryNavigation from './lib/components/secondary-navigation';
import TertiaryNavigation from './lib/components/tertiary-navigation';
import Toolbar from './lib/components/toolbar';

import Caret from './lib/assets/icons/caret';

const COMPONENTS = {
  AcceptableUseNotification,
  DevEnvWarning,
  ErrorMessage,
  Header,
  List,
  ListItem,
  Loader,
  MainNavigation,
  NotFound,
  PageTitle,
  SidebarNavigation,
  SecondaryNavigation,
  TertiaryNavigation,
  Toolbar,
};

const ICONS = {
  Caret,
};

export {
  BaseStyling,
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
