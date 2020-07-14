import { css } from 'styled-components';

export const button = css`
  display: inline-flex;
  align-items: center;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 3px;
  padding: 6px 12px;
  font-weight: 700;
  border: 1px solid #000;
  transition: all 0.15s ease-in-out;
`;

export const buttonPrimary = css`
  background-color: #ee7325;
  border-color: #ee7325;
  color: #fff;

  &:hover {
    background-color: #dc6011;
    border-color: #d05b10;
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

export const buttonWithIcon = css`
  padding-left: 9px;
  padding-right: 9px;

  span,
  svg {
    margin: 0 3px;
  }
`;
