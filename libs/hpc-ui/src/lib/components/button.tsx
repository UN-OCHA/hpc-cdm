import React from 'react';
import { IconType } from 'react-icons/lib';
import { Link } from 'react-router-dom';

import { combineClasses } from '../classes';
import { styled } from '../theme';
import Caret from '../assets/icons/caret';

const CLS = {
  ACTIVE: 'active',
};

const COLOR_CLS = {
  primary: 'color-primary',
  secondary: 'color-secondary',
  neutral: 'color-neutral',
} as const;

interface Props {
  className?: string;
  color: keyof typeof COLOR_CLS;
  behaviour:
    | {
        type: 'button';
        onClick: () => void;
      }
    | {
        type: 'link';
        to: string;
      };
  text: string;
  startIcon?: IconType | false;
  endIcon?: IconType | false;
  /**
   * If true, add a caret icon
   */
  displayCaret?: boolean;
  /**
   * If true, set the styling of this button to "active",
   * similar visually to hover of focus styling.
   */
  active?: boolean;
}

const Button = (props: Props) => {
  const {
    color,
    behaviour,
    text,
    startIcon: StartIcon,
    endIcon: EndIcon,
    displayCaret,
    active,
  } = props;

  const className = combineClasses(
    props.className,
    COLOR_CLS[color],
    active && CLS.ACTIVE
  );

  const contents = (
    <>
      {StartIcon && <StartIcon size={16} />}
      <span>{text}</span>
      {EndIcon && <EndIcon size={16} />}
      {displayCaret && <Caret direction="end" size={16} />}
    </>
  );

  return behaviour.type === 'button' ? (
    <button className={className} onClick={behaviour.onClick}>
      {contents}
    </button>
  ) : (
    <Link className={className} to={behaviour.to}>
      {contents}
    </Link>
  );
};

const StyledButton = styled(Button)`
  height: 30px;
  display: flex;
  padding: 0 ${(p) => p.theme.marginPx.md}px;
  box-sizing: border-box;
  border: 1px solid ${(p) => p.theme.colors.pallete.gray.light};
  color: ${(p) => p.theme.colors.pallete.gray.light};
  align-items: center;
  border-radius: 2px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 12px;

  &:hover,
  &:focus,
  &.${CLS.ACTIVE} {
    text-decoration: none;
    background-color: ${(p) => p.theme.colors.pallete.gray.light};
    color: #fff;
  }

  > * {
    margin: 0 ${(p) => p.theme.marginPx.sm}px;
  }
`;

export default StyledButton;

type ButtonLinkProps = Omit<Props, 'behaviour'> & { to: string };

export const ButtonLink = (props: ButtonLinkProps) => (
  <StyledButton behaviour={{ type: 'link', to: props.to }} {...{ ...props }} />
);
