import React from 'react';
import { styled } from '../theme';
import { MdWarning } from 'react-icons/md';

import { IconType } from 'react-icons/lib';

const CLS = {
  BUTTONS: 'buttons',
};

interface Props {
  className?: string;
  strings: {
    title: string;
    info?: string;
  };
  icon?: IconType | false;
  buttons?: JSX.Element[] | JSX.Element;
}
const ErrorMessage = ({
  className,
  strings,
  buttons,
  icon: Icon = MdWarning,
}: Props) => (
  <div className={className}>
    {Icon && <Icon size={60} />}
    <h3>{strings.title}</h3>
    {strings.info && <p>{strings.info}</p>}
    {buttons && <div className={CLS.BUTTONS}>{buttons}</div>}
  </div>
);

export default styled(ErrorMessage)`
  text-align: center;
  padding: ${(p) => p.theme.marginPx.md}px;

  svg {
    margin-bottom: -1rem;
    color: ${(p) => p.theme.colors.secondary.normal};
  }

  > .${CLS.BUTTONS} {
    display: inline-flex;
  }
`;
