import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { CLASSES, combineClasses } from '../classes';
import HpcLogo from '../assets/logos/hpc';
import CdmLogo from '../assets/logos/cdm';
import CdmName from '../assets/logos/cdm-name';
import { styled } from '../theme';

const CLS = {
  HEADER: 'header',
  LOGO: 'logo',
  HEADER_SEPARATOR: 'header-separator',
  APP_LOGO: 'app-logo',
  TABS: 'tabs',
  SELECTED: 'selected',
} as const;

interface Props {
  homeLink: string;
  tabs?: Array<
    | {
        path: string;
        label: string;
        selected?: boolean;
      }
    | null
    | undefined
    | false
  >;
}

const HEADER_HEIGHT_PX = 80;
const BORDER_BOTTOM_WIDTH = '4px';

const Nav = styled.nav`
  border-bottom: ${BORDER_BOTTOM_WIDTH} solid ${(p) => p.theme.colors.dividers};

  > div {
    height: ${HEADER_HEIGHT_PX}px;

    > .${CLS.HEADER} {
      display: flex;
      height: 48px;

      > .${CLS.LOGO} {
        height: 100%;
      }

      > .${CLS.HEADER_SEPARATOR} {
        margin: 0 25px;
        width: 1px;
        height: 100%;
        background-color: ${(p) => p.theme.colors.dividers};
      }

      > .${CLS.APP_LOGO} {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
      }
    }
    > .${CLS.TABS} {
      display: flex;
      margin: 0;
      padding: 0;
      display: flex;
      margin-bottom: -${BORDER_BOTTOM_WIDTH};
      list-style: none;
      border-right: 1px solid ${(p) => p.theme.colors.dividers};

      > li {
        border-left: 1px solid ${(p) => p.theme.colors.dividers};

        > a {
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${HEADER_HEIGHT_PX}px;
          padding: 0 21px;
          border-bottom: ${BORDER_BOTTOM_WIDTH} solid
            ${(p) => p.theme.colors.dividers};
          color: ${(p) => p.theme.colors.text};
          font-weight: bold;
          text-transform: uppercase;
          text-decoration: none;

          &:hover {
            background: ${(p) => p.theme.colors.pallete.gray.light5};
          }
        }

        &.${CLS.SELECTED} > a {
          border-bottom-color: ${(p) => p.theme.colors.primary.normal};
        }
      }
    }
  }
`;

export default (props: Props) => {
  const { tabs, homeLink } = props;

  const loc = useLocation();
  const tabElements = tabs && (
    <ul className={CLS.TABS}>
      {tabs.map((tab, i) => {
        if (!tab) {
          return null;
        }
        const selected =
          tab.selected === undefined
            ? loc.pathname === tab.path ||
              loc.pathname.startsWith(tab.path + '/')
            : tab.selected;
        return (
          <li key={i} className={selected ? CLS.SELECTED : ''}>
            <Link to={tab.path}>
              <span>{tab.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <Nav>
      <div
        className={combineClasses(
          CLASSES.CONTAINER.CENTERED,
          CLASSES.FLEX.CONTAINER
        )}
      >
        <div className={CLS.HEADER}>
          <HpcLogo className={CLS.LOGO} />
          <div className={CLS.HEADER_SEPARATOR} />
          <Link className={CLS.APP_LOGO} to={homeLink}>
            <CdmLogo />
            <CdmName />
          </Link>
        </div>
        <div className={CLASSES.FLEX.GROW} />
        {tabElements}
      </div>
    </Nav>
  );
};
