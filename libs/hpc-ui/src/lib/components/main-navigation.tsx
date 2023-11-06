import { Link, useLocation } from 'react-router-dom';
import React from 'react';

import {
  List as MUIList,
  ListItem as MUIListItem,
  ListItemButton as MUIListItemButton,
} from '@mui/material';
import { CLASSES, combineClasses } from '../classes';
import HpcLogo from '../assets/logos/hpc';
import { styled } from '../theme';
import { Button } from './button';
import { MdAdd } from 'react-icons/md';

const CLS = {
  HEADER: 'header',
  LOGO: 'logo',
  LOGO_CONTAINER: 'logo-container',
  HEADER_SEPARATOR: 'header-separator',
  APP_LOGO: 'app-logo',
  EXTERNAL_LINKS: 'external-links',
  TABS: 'tabs',
  SELECTED: 'selected',
  HAS_EXTERNAL_LINKS: 'has-external-links',
  ACTION_BUTTONS: 'action-buttons',
} as const;

interface Props {
  homeLink: string;
  appTitle: JSX.Element;
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
  externalLinks?: Array<
    | {
        url: string;
        label: string;
      }
    | null
    | undefined
    | false
  >;
  className?: string;
  actionButtons?: Array<
    | {
        path: string;
        label: string;
      }
    | null
    | undefined
    | false
  >;
}

const HEADER_HEIGHT_PX = 60;
const BORDER_BOTTOM_WIDTH = '3px';

const Nav = styled.nav`
  border-bottom: ${BORDER_BOTTOM_WIDTH} solid ${(p) => p.theme.colors.dividers};

  > div {
    height: ${HEADER_HEIGHT_PX}px;

    > .${CLS.HEADER} {
      display: flex;
      align-items: center;
      color: #221e1f;

      .${CLS.LOGO} {
        max-height: 36px;
      }

      > .${CLS.HEADER_SEPARATOR} {
        margin: 0 18px;
        width: 1px;
        height: 36px;
        background-color: ${(p) => p.theme.colors.dividers};
      }

      > .${CLS.APP_LOGO} {
        height: 38px;
        margin-bottom: -2px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        color: #221e1f;

        &:hover {
          text-decoration: none;
        }
      }
    }

    .${CLS.LOGO_CONTAINER} {
      position: relative;
      z-index: 1;
      display: flex;
      height: 36px;

      &.${CLS.HAS_EXTERNAL_LINKS} {
        cursor: pointer;

        &:hover {
          .${CLS.EXTERNAL_LINKS} {
            display: block;
          }
        }
      }
    }

    .${CLS.EXTERNAL_LINKS} {
      position: absolute;
      top: 100%;
      left: 0;
      display: none;
      background: ${(p) => p.theme.colors.panel.bg};
      white-space: nowrap;
    }

    .${CLS.ACTION_BUTTONS} {
      margin-left: 15px;
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

          &:hover,
          &:focus {
            outline: none;
            background: ${(p) => p.theme.colors.pallete.gray.light5};
          }
        }

        &.${CLS.SELECTED} > a {
          border-bottom-color: ${(p) => p.theme.colors.secondary.normal};
        }
      }
    }
  }
`;

export default (props: Props) => {
  const { tabs, externalLinks, appTitle, homeLink, actionButtons } = props;

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

  const externalLinksElements = externalLinks && (
    <MUIList className={CLS.EXTERNAL_LINKS}>
      {externalLinks.map((link, i) => {
        if (!link) {
          return null;
        }
        return (
          <MUIListItem disablePadding key={i}>
            <MUIListItemButton href={link.url}>{link.label}</MUIListItemButton>
          </MUIListItem>
        );
      })}
    </MUIList>
  );

  const actionButtonElements = actionButtons && (
    <div className={CLS.ACTION_BUTTONS}>
      {actionButtons.map((link, i) => {
        if (!link) {
          return null;
        }
        return (
          <React.Fragment key={i}>
            <Link to={link.path}>
              <Button
                color="primary"
                onClick={() => {
                  return true;
                }}
                startIcon={MdAdd}
                text={link.label}
              />
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <Nav>
      <div
        className={combineClasses(
          CLASSES.CONTAINER.CENTERED,
          CLASSES.FLEX.CONTAINER,
          props.className
        )}
      >
        <div className={CLS.HEADER}>
          <div
            className={combineClasses(
              CLS.LOGO_CONTAINER,
              externalLinks && CLS.HAS_EXTERNAL_LINKS
            )}
          >
            <HpcLogo className={CLS.LOGO} />
            {externalLinksElements}
          </div>
          <div className={CLS.HEADER_SEPARATOR} />
          <Link className={CLS.APP_LOGO} to={homeLink}>
            {appTitle}
          </Link>
        </div>
        <div className={CLASSES.FLEX.GROW} />
        {tabElements}
        {actionButtonElements}
      </div>
    </Nav>
  );
};
