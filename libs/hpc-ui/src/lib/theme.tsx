import React from 'react';
import styled, {
  css,
  ThemedCssFunction,
  ThemedStyledInterface,
  ThemeProvider as SCThemeProvider,
} from 'styled-components';
import {
  ThemeProvider as MUIThemeProvider,
  createMuiTheme,
} from '@material-ui/core';

const COLOR_PALETTE = {
  orange: {
    dark2: '#d05b10',
    dark1: '#dc6011',
    normal: '#ee7325',
  },
  blue: {
    dark2: '#025995',
    dark1: '#026cb6',
  },
  gray: {
    normal: '#4a4a4a',
    light1: '#d1d1d1',
    light2: '#e6e6e6',
    light3: '#efefef',
  },
};

export const THEME = {
  colors: {
    pallete: COLOR_PALETTE,
    primary: COLOR_PALETTE.orange,
    secondary: COLOR_PALETTE.blue,
    text: COLOR_PALETTE.gray.normal,
    textLink: COLOR_PALETTE.orange.dark2,
    panel: {
      border: COLOR_PALETTE.gray.light1,
      bg: COLOR_PALETTE.gray.light3,
      bgHover: COLOR_PALETTE.gray.light2,
    },
  },
  marginPx: {
    sm: 5,
    md: 15,
  },
  sizing: {
    borderRadiusSm: '3px',
    borderRadiusMd: '6px',
    containerWidthPx: 1240,
  },
} as const;

export const MUI_THEME = createMuiTheme({
  palette: {
    primary: {
      main: THEME.colors.primary.normal,
    },
    secondary: {
      main: THEME.colors.secondary.dark1,
    },
  },
});

export type Theme = typeof THEME;

const themedStyled: ThemedStyledInterface<Theme> = styled;
const themedCSS: ThemedCssFunction<Theme> = css;

export { themedStyled as styled, themedCSS as css };

export const ThemeProvider = (props: {
  children: JSX.Element | JSX.Element[];
}) => (
  <SCThemeProvider theme={THEME}>
    <MUIThemeProvider theme={MUI_THEME}>{props.children}</MUIThemeProvider>
  </SCThemeProvider>
);
