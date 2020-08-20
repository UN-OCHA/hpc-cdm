import React from 'react';
import { Link } from 'react-router-dom';

import { styled } from '../theme';

const CLS = {
  LAST: 'last',
};

interface Props {
  className?: string;
  links: Array<{
    label: string;
    to: string;
  }>;
}

export type BreadcrumbLinks = Props['links'];

const Breadcrumbs = (props: Props) => (
  <div className={props.className}>
    {props.links.map((link, i, links) => {
      const last = i === links.length - 1;
      return last ? (
        <Link key={i} className={CLS.LAST} to={link.to}>
          {link.label}
        </Link>
      ) : (
        <React.Fragment key={i}>
          <Link to={link.to}>{link.label}</Link>
          <span>&gt;</span>
        </React.Fragment>
      );
    })}
  </div>
);

export default styled(Breadcrumbs)`
  display: flex;
  font-size: 1.3rem;
  font-weight: 600;

  > span {
    color: ${(p) => p.theme.colors.textLight};
    margin: 0 0.5rem;
  }

  > a {
    color: ${(p) => p.theme.colors.textLight};

    &.${CLS.LAST} {
      color: ${(p) => p.theme.colors.text};
    }
  }
`;
