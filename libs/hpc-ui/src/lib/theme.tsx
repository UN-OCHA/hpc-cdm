import { ThemeProvider as MUIThemeProvider } from '@mui/material';
import { arSA, enUS, esES, frFR, zhCN } from '@mui/material/locale';
import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { useMemo } from 'react';

/**
 * Extend `Theme` so typescript can pickup custom Theme
 */
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

const COLOR_PALETTE = {
  red: {
    dark: '#990000',
    light: '#ffb3b3',
  },
  orange: {
    dark2: '#b44d0e',
    dark1: '#d05b10',
    normal: '#e16856', // From style guide
    variant1: '#e19956',
    light: '#fd9282',
  },
  yellow: {
    normal: '#FFC000',
  },
  blue: {
    dark2: '#025995',
    normal: '#026cb6', // From style guide
    light: '#96c3e1',
  },
  green: {
    normal: '#2e7d32',
    light: '#afdfb0',
  },
  gray: {
    normal: '#333333', // From style guide
    light: '#6f7e94', // From style guide
    light1: '#999999',
    light2: '#d1d1d1',
    light3: '#dadada',
    light4: '#e6ecf1', // From style guide
    light5: '#f3f5f8', // From style guide
  },
};

const MAIN_NAVIGATION_HEIGHT_PX = 60;
const MAIN_NAVIGATION_BORDER_BOTTOM_PX = 3;

const HEADER_MIN_HEIGHT_PX = 35;
/**
 * In dev environments, there is an extra header of 40px
 */
const TOTAL_HEADER_HEIGHT = `${
  MAIN_NAVIGATION_HEIGHT_PX +
  MAIN_NAVIGATION_BORDER_BOTTOM_PX +
  HEADER_MIN_HEIGHT_PX
}px`;

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
    borderRadiusSm: '4px',
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
    header: {
      minHeight: HEADER_MIN_HEIGHT_PX,
    },
    mainNavigation: {
      height: MAIN_NAVIGATION_HEIGHT_PX,
      borderBottom: MAIN_NAVIGATION_BORDER_BOTTOM_PX,
    },
    totalHeaderHeight: TOTAL_HEADER_HEIGHT,
  },
  animations: {
    fast: '0.2s ease-out',
  },
} as const;
/** TODO: Unify TailwindCSS and MUI Theme into one file */
export const MUI_THEME: ThemeOptions = {
  direction: 'ltr',
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
  },
  palette: {
    primary: {
      main: THEME.colors.primary.normal,
    },
    secondary: {
      main: THEME.colors.secondary.normal,
    },
    warning: {
      main: THEME.colors.pallete.yellow.normal,
    },
  },
  ...THEME,
};
const MUI_THEME_RTL: ThemeOptions = {
  ...MUI_THEME,
  direction: 'rtl',
};
export type Theme = typeof THEME;

const localeMapper = {
  ar: arSA,
  en: enUS,
  fr: frFR,
  es: esES,
  zh: zhCN,
};

export const ThemeProvider = (props: {
  children: JSX.Element | JSX.Element[];
  language?: keyof typeof localeMapper;
}) => {
  const { language, children } = props;
  const muiTheme = useMemo(() => {
    return createTheme(
      language && language === 'ar' ? MUI_THEME_RTL : MUI_THEME,
      language ? localeMapper[language] : enUS
    );
  }, [language]);

  return <MUIThemeProvider theme={muiTheme}>{children}</MUIThemeProvider>;
};

export { css, styled } from 'styled-components';
