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
  greenLight: 'green-light',
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
        type: 'submit';
        onClick?: () => void;
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
      type={behaviour.type}
      onClick={behaviour.onClick}
      ref={ref as React.RefObject<HTMLButtonElement>}
    >
      {contents}
    </button>
  ) : behaviour.type === 'submit' ? (
    <button
      className={className}
      onClick={behaviour.onClick}
      type={behaviour.type}
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
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  background-color: transparent;
  outline: 0px;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  appearance: none;
  text-decoration: none;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 1.5rem;
  line-height: 1.75;
  letter-spacing: 0.02857em;
  text-transform: uppercase;
  min-width: 64px;
  padding: 5px 15px;
  border-radius: 4px;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border: 1px solid rgba(25, 118, 210, 0.5);
  color: rgb(25, 118, 210);

  &:hover,
  &:focus,
  &.${CLS.ACTIVE} {
    text-decoration: none;
    background-color: rgba(25, 118, 210, 0.04);
    border: 1px solid rgb(25, 118, 210);
  }

  &.${CLS.CONDENSED} {
    padding: 0 ${(p) => p.theme.marginPx.sm * 0.5}px;
  }

  &.${COLOR_CLS.primary} {
    text-decoration: none;
    background-color: transparent;
    border: 1px solid rgb(25, 118, 210);

    &:hover,
    &:focus,
    &.${CLS.ACTIVE} {
      background-color: rgba(25, 118, 210, 0.04);
      border: 1px solid rgb(25, 118, 210);
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

  &.${COLOR_CLS.greenLight} {
    border: 1px solid ${(p) => p.theme.colors.greenLight};
    color: ${(p) => p.theme.colors.greenLight};
    &:hover,
    &:focus,
    &.${CLS.ACTIVE} {
      background-color: ${(p) => p.theme.colors.greenLight};
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

type ButtonSubmitProps = Omit<Props, 'behaviour'> & { onClick?: () => void };
export const ButtonSubmit = (props: ButtonSubmitProps) => (
  <StyledBaseButton
    behaviour={{ type: 'submit', onClick: props.onClick }}
    {...{ ...props }}
  />
);
