import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { CLASSES } from '../classes';
import { styled } from '../theme';
import Caret from '../assets/icons/caret';

const CLS = {
  LAST_BREADCRUMB: 'last',
  BREADCRUMB_CARET: 'caret',
  /**
   * An invisible version of the tab label that's always bold to allow for
   * a constant size even when changing weight
   */
  TAB_INVISIBLE_LABEL: 'tab-invisible-label',
  TAB_VISIBLE_LABEL: 'tab-visible-label',
  SELECTED_TAB: 'selected',
};

interface Props {
  breadcrumbs: Array<{
    label: string;
    to: string;
  }>;
  tabs: Array<
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

const Container = styled.div`
  background: ${(p) => p.theme.colors.pallete.gray.light5};
`;

const Breadcrumbs = styled.div`
  padding: 2.6rem 0;
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.pallete.gray.light};

  > .${CLS.BREADCRUMB_CARET} {
    margin: 0 0.5rem;
  }

  > a {
    color: ${(p) => p.theme.colors.pallete.gray.light};

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

const TabList = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
`;

const Tab = styled.li`
  display: block;

  > a {
    position: relative;
    font-size: 1.8rem;
    display: block;
    padding: 0 32px;
    height: 40px;
    border-bottom: none;
    border-top-left-radius: ${(p) => p.theme.sizing.borderRadiusMd};
    border-top-right-radius: ${(p) => p.theme.sizing.borderRadiusMd};
    text-decoration: none;
    cursor: pointer;
    color: ${(p) => p.theme.colors.pallete.gray.light};

    &:hover {
      text-decoration: none;
      color: ${(p) => p.theme.colors.primary.normal};
    }

    > .${CLS.TAB_INVISIBLE_LABEL} {
      font-weight: bold;
      opacity: 0;
      pointer-events: none;
    }

    > .${CLS.TAB_VISIBLE_LABEL} {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      line-height: 40px;
      text-align: center;
    }
  }

  &.${CLS.SELECTED_TAB} {
    a {
      font-weight: bold;
      background: #fff;
      color: ${(p) => p.theme.colors.text};
    }
  }
`;

const SecondaryNavigation = (props: Props) => {
  const { breadcrumbs, tabs } = props;
  const loc = useLocation();

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

  const tabElements = (
    <TabList>
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
          <Tab key={i} className={selected ? CLS.SELECTED_TAB : ''}>
            <Link to={tab.path}>
              <span className={CLS.TAB_INVISIBLE_LABEL}>{tab.label}</span>
              <span className={CLS.TAB_VISIBLE_LABEL}>{tab.label}</span>
            </Link>
          </Tab>
        );
      })}
    </TabList>
  );

  return (
    <Container role="navigation">
      <div className={CLASSES.CONTAINER.CENTERED}>
        {breadcrumbElements}
        {tabElements}
      </div>
    </Container>
  );
};

export default SecondaryNavigation;
