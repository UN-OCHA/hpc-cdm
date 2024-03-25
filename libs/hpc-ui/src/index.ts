import { CLASSES, combineClasses } from './lib/classes';
import { BaseStyling } from './lib/styling';
import { css, styled, THEME, ThemeProvider } from './lib/theme';
import type { Theme } from './lib/theme';
import { dataLoader, useDataLoader } from './lib/util';
import type { DataLoaderState } from './lib/util';
import { Translations } from './lib/i18n';
import { FormObjectValue } from './lib/components/form-fields/types/types';

import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import * as actionableButton from './lib/components/actionable-button';
import ActionableDropdown from './lib/components/actionable-dropdown';
import AutocompleteSelect from './lib/components/form-fields/autocomplete-field';
import AsyncAutocompleteSelect from './lib/components/form-fields/async-autocomplete-field';
import AsyncMultiSelect from './lib/components/form-fields/async-multi-select-field';
import AsyncIconButton from './lib/components/async-icon-button';
import AsyncSingleSelect from './lib/components/form-fields/async-single-select-field';
import { Button, ButtonLink, ButtonSubmit } from './lib/components/button';
import CheckBox from './lib/components/form-fields/checkbox';
import DatePicker from './lib/components/form-fields/date-picker';
import DevEnvWarning from './lib/components/development-environment-warning';
import Divider from './lib/components/divider';
import DraggableList from './lib/components/draggable-list';
import ErrorMessage from './lib/components/error-message';
import Header from './lib/components/header';
import List from './lib/components/list';
import ListItem from './lib/components/list-item';
import Loader from './lib/components/loader';
import MainNavigation from './lib/components/main-navigation';
import MultiTextField from './lib/components/form-fields/multi-text-field';
import MultiSelect from './lib/components/form-fields/multi-select-field';
import NotFound from './lib/components/not-found';
import PageTitle from './lib/components/page-title';
import * as sidebarNavigation from './lib/components/sidebar-navigation';
import SearchFilter from './lib/components/search-filter';
import SecondaryNavigation from './lib/components/secondary-navigation';
import Section from './lib/components/section';
import SingleSelect from './lib/components/form-fields/single-select-field';
import Switch from './lib/components/form-fields/switch';
import TertiaryNavigation from './lib/components/tertiary-navigation';
import TextFieldWrapper from './lib/components/form-fields/text-field';
import Toolbar from './lib/components/toolbar';
import * as dialogs from './lib/components/dialogs';

import Caret from './lib/assets/icons/caret';
import Gear from './lib/assets/icons/gear';

const COMPONENTS = {
  AcceptableUseNotification,
  ActionableButton: actionableButton.ActionableButton,
  ActionableDropdown,
  ActionableIconButton: actionableButton.ActionableIconButton,
  AutocompleteSelect,
  AsyncAutocompleteSelect,
  AsyncIconButton,
  AsyncMultiSelect,
  AsyncSingleSelect,
  Button,
  ButtonLink,
  ButtonSubmit,
  CheckBox,
  DatePicker,
  DevEnvWarning,
  Divider,
  DraggableList,
  ErrorMessage,
  Header,
  List,
  ListItem,
  Loader,
  MainNavigation,
  MultiSelectWrapper: MultiSelect,
  MultiTextField,
  NotFound,
  PageTitle,
  SidebarNavigation: sidebarNavigation.default,
  SingleSelect,
  SearchFilter,
  Section,
  SecondaryNavigation,
  Switch,
  TertiaryNavigation,
  TextFieldWrapper,
  Toolbar,
};

const ICONS = {
  Caret,
  Gear,
};

export type ActionableButtonState = actionableButton.ActionableButtonState;
export type SidebarNavigationItem = sidebarNavigation.SidebarNavigationItem;

export {
  BaseStyling,
  CLASSES,
  combineClasses,
  COMPONENTS as C,
  css,
  dataLoader,
  useDataLoader,
  ICONS,
  styled,
  THEME,
  ThemeProvider,
  Translations,
  dialogs,
  FormObjectValue,
};

export type { DataLoaderState, Theme };
