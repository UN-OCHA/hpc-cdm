import { css } from './theme';

export const button = css`
  display: inline-flex;
  align-items: center;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: ${(p) => p.theme.sizing.borderRadiusSm};
  padding: 6px 12px;
  font-weight: 700;
  border: 1px solid #000;
  transition: all 0.15s ease-in-out;
`;

export const buttonPrimary = css`
  background-color: ${(p) => p.theme.colors.primary.normal};
  border-color: ${(p) => p.theme.colors.primary.normal};
  color: #fff;

  &:hover {
    background-color: ${(p) => p.theme.colors.primary.dark1};
    border-color: ${(p) => p.theme.colors.primary.dark2};
  }
`;

export const buttonClear = css`
  background-color: rgba(255, 255, 255, 0);
  border-color: rgba(255, 255, 255, 0);
  color: #fff;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

export const buttonGray = css`
  background-color: ${(p) => p.theme.colors.pallete.gray.light4};
  border-color: ${(p) => p.theme.colors.pallete.gray.light2};
  color: ${(p) => p.theme.colors.pallete.gray.normal};

  &:hover {
    background-color: ${(p) => p.theme.colors.pallete.gray.light3};
  }
`;

export const buttonWithIcon = css`
  padding-left: 9px;
  padding-right: 9px;

  svg {
    margin: -20px 3px;
  }

  span {
    margin: 0 3px;
  }
`;
