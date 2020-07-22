import styled, {
  css,
  ThemedCssFunction,
  ThemedStyledInterface,
} from 'styled-components';

const COLOR_PALETTE = {
  orange: {
    dark2: '#d05b10',
    dark1: '#dc6011',
    normal: '#ee7325',
  },
  gray: {
    normal: '#4a4a4a',
    light1: '#d1d1d1',
    light2: '#efefef',
  },
};

export const THEME = {
  colors: {
    pallete: COLOR_PALETTE,
    primary: COLOR_PALETTE.orange,
    text: COLOR_PALETTE.gray.normal,
    textLink: COLOR_PALETTE.orange.dark2,
    panel: {
      border: COLOR_PALETTE.gray.light1,
      bg: COLOR_PALETTE.gray.light2,
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

export type Theme = typeof THEME;

const themedStyled: ThemedStyledInterface<Theme> = styled;
const themedCSS: ThemedCssFunction<Theme> = css;

export { themedStyled as styled, themedCSS as css };
