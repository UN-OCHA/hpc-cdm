import { merge } from 'lodash';
import { useMemo } from 'react';
import styled, {
  css,
  ThemedCssFunction,
  ThemedStyledInterface,
} from 'styled-components';
import { ThemeProvider as MUIThemeProvider } from '@mui/material';
import { enUS, frFR } from '@mui/material/locale';
import { createTheme, ThemeOptions } from '@mui/material/styles';

const COLOR_PALETTE = {
  red: {
    dark: '#990000',
    light: '#ffb3b3',
  },
  orange: {
    dark2: '#b44d0e',
    dark1: '#d05b10',
    normal: '#e16856', // from style guide
  },
  yellow: {
    normal: '#FFC000',
  },
  blue: {
    dark2: '#025995',
    normal: '#026cb6', // from style guide
    light: '#96c3e1',
  },
  green: {
    light: '#afdfb0',
  },
  gray: {
    normal: '#333333', // from style guide
    light: '#6f7e94', // from style guide
    light1: '#999999',
    light2: '#d1d1d1',
    light3: '#dadada',
    light4: '#e6ecf1', // from style guide
    light5: '#f3f5f8', // from style guide
  },
};

export const THEME = {
  colors: {
    pallete: COLOR_PALETTE,
    primary: COLOR_PALETTE.blue,
    secondary: COLOR_PALETTE.orange,
    text: COLOR_PALETTE.gray.normal,
    textLight: COLOR_PALETTE.gray.light,
    textLink: COLOR_PALETTE.orange.dark2,
    textError: COLOR_PALETTE.red.dark,
    textErrorLight: COLOR_PALETTE.red.light,
    dividers: COLOR_PALETTE.gray.light4,
    panel: {
      border: COLOR_PALETTE.gray.light2,
      bg: COLOR_PALETTE.gray.light5,
      bgSelected: COLOR_PALETTE.gray.light3,
      bgHover: COLOR_PALETTE.gray.light4,
    },
  },
  marginPx: {
    sm: 5,
    md: 15,
    lg: 30,
  },
  sizing: {
    borderRadiusSm: '3px',
    borderRadiusMd: '6px',
    containerWidthPx: 1240,
    fontSizeSm: '0.8rem',
    /**
     * Standard height to use for single-line item block components,
     * such as list headers, list items, or sidebar menu items.
     *
     * (this excludes the height of any top and bottom borders)
     */
    singleLineBlockItemHeightPx: 49,
  },
  animations: {
    fast: '0.2s ease-out',
  },
  typography: {
    fontFamilyBase:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
  },
} as const;

export const MUI_THEME: ThemeOptions = {
  components: {
    MuiTextField: {
      defaultProps: {
        margin: 'normal',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'normal',
      },
    },
  },
  typography: {
    htmlFontSize: 10,
    fontFamily: THEME.typography.fontFamilyBase,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.4rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 700,
    },
  },
  palette: {
    primary: {
      main: THEME.colors.primary.normal,
    },
    secondary: {
      main: THEME.colors.secondary.normal,
    },
  },
};

export type Theme = typeof THEME;

const themedStyled: ThemedStyledInterface<Theme> = styled;
const themedCSS: ThemedCssFunction<Theme> = css;

export { themedStyled as styled, themedCSS as css };

const localeMapper = {
  en: enUS,
  fr: frFR,
};

export const ThemeProvider = (props: {
  children: JSX.Element | JSX.Element[];
  language?: keyof typeof localeMapper;
}) => {
  const { language } = props;
  const muiTheme = useMemo(() => {
    return createTheme(
      merge(THEME, MUI_THEME),
      language ? localeMapper[language] : enUS
    );
  }, [language]);

  return <MUIThemeProvider theme={muiTheme}>{props.children}</MUIThemeProvider>;
};
