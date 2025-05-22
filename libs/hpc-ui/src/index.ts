import AcceptableUseNotification from './lib/components/acceptable-use-notification';
import * as actionableButton from './lib/components/actionable-button';
import ActionableDropdown from './lib/components/actionable-dropdown';
import AsyncIconButton from './lib/components/async-icon-button';
import { Button, ButtonLink, ButtonSubmit } from './lib/components/button';
import DevEnvWarning from './lib/components/development-environment-warning';
import Divider from './lib/components/divider';
import DraggableList from './lib/components/draggable-list';
import ErrorMessage from './lib/components/error-message';
import ErrorAlert from './lib/components/error-message-alert';
import AsyncAutocompleteSelect from './lib/components/form-fields/async-autocomplete-field';
import AutocompleteSelect from './lib/components/form-fields/autocomplete-field';
import CheckBox from './lib/components/form-fields/checkbox';
import DatePicker from './lib/components/form-fields/date-picker';
import MultiTextField from './lib/components/form-fields/multi-text-field';
import NumberField from './lib/components/form-fields/number-field';
import Switch from './lib/components/form-fields/switch';
import TextFieldWrapper from './lib/components/form-fields/text-field';
import Header from './lib/components/header';
import List from './lib/components/list';
import ListItem from './lib/components/list-item';
import Loader from './lib/components/loader';
import MainNavigation from './lib/components/main-navigation';
import NotFound from './lib/components/not-found';
import PageTitle from './lib/components/page-title';
import SearchFilter from './lib/components/search-filter';
import SecondaryNavigation from './lib/components/secondary-navigation';
import Section from './lib/components/section';
import * as sidebarNavigation from './lib/components/sidebar-navigation';
import TertiaryNavigation from './lib/components/tertiary-navigation';
import Toolbar from './lib/components/toolbar';

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
  Button,
  ButtonLink,
  ButtonSubmit,
  CheckBox,
  DatePicker,
  DevEnvWarning,
  Divider,
  DraggableList,
  ErrorMessage,
  ErrorAlert,
  Header,
  List,
  ListItem,
  Loader,
  MainNavigation,
  MultiTextField,
  NotFound,
  NumberField,
  PageTitle,
  SidebarNavigation: sidebarNavigation.default,
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

export { COMPONENTS as C, ICONS };

export { CLASSES, combineClasses } from './lib/classes';
export * as dialogs from './lib/components/dialogs';
export { Translations } from './lib/i18n';
export { BaseStyling } from './lib/styling';
export { css, styled, THEME, ThemeProvider, type Theme } from './lib/theme';
export { dataLoader, useDataLoader, type DataLoaderState } from './lib/util';
