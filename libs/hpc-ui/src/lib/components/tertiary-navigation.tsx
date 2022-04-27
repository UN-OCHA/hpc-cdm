import React from 'react';
import { Link } from 'react-router-dom';
import Caret from '../assets/icons/caret';

import { CLASSES } from '../classes';
import { styled } from '../theme';

const CLS = {
  LAST_BREADCRUMB: 'last',
  BREADCRUMB_CARET: 'caret',
  ACTION_SELECTED: 'selected',
};

interface Props {
  breadcrumbs: Array<{
    label: string;
    to: string;
  }>;
  actions?: JSX.Element | JSX.Element[];
}

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.pallete.gray.light};
  text-transform: uppercase;

  > .${CLS.BREADCRUMB_CARET} {
    margin: 0 0.5rem;
  }

  > a {
    color: ${(p) => p.theme.colors.pallete.gray.light};
    white-space: nowrap;

    &.${CLS.LAST_BREADCRUMB} {
      color: ${(p) => p.theme.colors.text};
    }

    &:hover,
    &:focus {
      color: ${(p) => p.theme.colors.primary.normal};
      outline: none;
      text-decoration: none;
    }
  }
`;

const Container = styled.div`
  padding: ${(p) => p.theme.marginPx.lg}px 0 12px;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid ${(p) => p.theme.colors.pallete.gray.light};
`;

const SecondaryNavigation = (props: Props) => {
  const { actions, breadcrumbs } = props;

  const breadcrumbElements = (
    <Breadcrumbs>
      {breadcrumbs.map((link, i, links) => {
        const last = i === links.length - 1;
        return last ? (
          <Link key={i} className={CLS.LAST_BREADCRUMB} to={link.to}>
            {link.label}
          </Link>
        ) : (
          <React.Fragment key={i}>
            <Link to={link.to}>{link.label}</Link>
            <Caret direction="end" size={11} className={CLS.BREADCRUMB_CARET} />
          </React.Fragment>
        );
      })}
    </Breadcrumbs>
  );

  return (
    <Container role="navigation">
      {breadcrumbElements}
      <div className={CLASSES.FLEX.GROW} />
      {actions}
    </Container>
  );
};

export default SecondaryNavigation;
