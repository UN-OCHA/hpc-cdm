import React, { useEffect, useRef, useState } from 'react';
import { IconType } from 'react-icons/lib';
import { Link } from 'react-router-dom';

import { combineClasses } from '../classes';
import { styled } from '../theme';
import Caret from '../assets/icons/caret';

const CLS = {
  ACTIVE: 'active',
  CONDENSED: 'condensed',
};

const COLOR_CLS = {
  primary: 'color-primary',
  secondary: 'color-secondary',
  neutral: 'color-neutral',
} as const;

export type ButtonColor = keyof typeof COLOR_CLS;

interface Props {
  className?: string;
  children?: JSX.Element | JSX.Element[];
  color: ButtonColor;
  behaviour:
    | {
        type: 'button';
        onClick: () => void;
      }
    | {
        type: 'link';
        to: string;
      };
  text?: string;
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
  condensed?: boolean;
  autoFocus?: boolean;
}

const BaseButton = (props: Props) => {
  const {
    children,
    color,
    behaviour,
    text,
    startIcon: StartIcon,
    endIcon: EndIcon,
    displayCaret,
    active,
    condensed,
    autoFocus,
  } = props;

  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLButtonElement | HTMLElement>(null);

  useEffect(() => {
    if (!focused && autoFocus && ref.current) {
      ref.current.focus();
      setFocused(true);
    }
  }, [focused, autoFocus, ref.current]);

  const className = combineClasses(
    props.className,
    COLOR_CLS[color],
    active && CLS.ACTIVE,
    condensed && CLS.CONDENSED
  );

  const contents = (
    <>
      {StartIcon && <StartIcon size={16} />}
      {text && <span>{text}</span>}
      {children && <span>{children}</span>}
      {EndIcon && <EndIcon size={16} />}
      {displayCaret && <Caret direction="end" size={16} />}
    </>
  );

  return behaviour.type === 'button' ? (
    <button
      className={className}
      onClick={behaviour.onClick}
      ref={ref as React.RefObject<HTMLButtonElement>}
    >
      {contents}
    </button>
  ) : (
    <Link
      className={className}
      to={behaviour.to}
      ref={ref as React.RefObject<HTMLAnchorElement>}
    >
      {contents}
    </Link>
  );
};

const StyledBaseButton = styled(BaseButton)`
  height: 3rem;
  display: inline-flex;
  padding: 0 ${(p) => p.theme.marginPx.md}px;
  box-sizing: border-box;
  background: none;
  border: 1px solid ${(p) => p.theme.colors.pallete.gray.light};
  color: ${(p) => p.theme.colors.pallete.gray.light};
  align-items: center;
  border-radius: 2px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus,
  &.${CLS.ACTIVE} {
    text-decoration: none;
    background-color: ${(p) => p.theme.colors.pallete.gray.light};
    color: #fff;
  }

  &.${CLS.CONDENSED} {
    padding: 0 ${(p) => p.theme.marginPx.sm * 0.5}px;
  }

  &.${COLOR_CLS.primary} {
    border: 1px solid ${(p) => p.theme.colors.primary.normal};
    color: ${(p) => p.theme.colors.primary.normal};

    &:hover,
    &:focus,
    &.${CLS.ACTIVE} {
      background-color: ${(p) => p.theme.colors.primary.normal};
      color: #fff;
    }
  }

  &.${COLOR_CLS.secondary} {
    border: 1px solid ${(p) => p.theme.colors.secondary.normal};
    color: ${(p) => p.theme.colors.secondary.normal};

    &:hover,
    &:focus,
    &.${CLS.ACTIVE} {
      background-color: ${(p) => p.theme.colors.secondary.normal};
      color: #fff;
    }
  }

  > * {
    margin: 0 ${(p) => p.theme.marginPx.sm}px;
  }
`;

type ButtonLinkProps = Omit<Props, 'behaviour'> & { to: string };

export const ButtonLink = (props: ButtonLinkProps) => (
  <StyledBaseButton
    behaviour={{ type: 'link', to: props.to }}
    {...{ ...props }}
  />
);

type ButtonProps = Omit<Props, 'behaviour'> & { onClick: () => void };

export const Button = (props: ButtonProps) => (
  <StyledBaseButton
    behaviour={{ type: 'button', onClick: props.onClick }}
    {...{ ...props }}
  />
);
