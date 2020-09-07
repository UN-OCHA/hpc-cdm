import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { styled } from '../theme';
import { CLASSES, combineClasses } from '../classes';

const CLS = {
  CHILDREN: 'children',
  INNER: 'inner',
  SELECTED: 'selected',
  MODE: {
    main: 'style-main',
    section: 'style-section',
  },
};

interface Props {
  className?: string;
  mode: 'main' | 'section';
  align: 'start' | 'end';
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
  children?: JSX.Element[] | JSX.Element;
}

const Tabs = (props: Props) => {
  const { className, mode, align, tabs, children } = props;
  const loc = useLocation();
  const tabElements = (
    <ul>
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
    <div
      role="navigation"
      className={combineClasses(CLS.MODE[mode], className)}
    >
      {align === 'end' ? (
        <div className={combineClasses(CLS.INNER)}>
          <div className={CLS.CHILDREN}>{children}</div>
          <span className={CLASSES.FLEX.GROW} />
          {tabElements}
        </div>
      ) : (
        <div className={combineClasses(CLS.INNER)}>
          {tabElements}
          <span className={CLASSES.FLEX.GROW} />
          <div className={CLS.CHILDREN}>{children}</div>
        </div>
      )}
    </div>
  );
};

export default styled(Tabs)`
  border-bottom: 1px solid ${(p) => p.theme.colors.panel.border};

  > .${CLS.INNER} {
    max-width: ${(p) => p.theme.sizing.containerWidthPx}px;
    margin: 0 auto;
    display: flex;
    align-items: flex-end;

    > h2 {
      margin: 0;
    }

    ul {
      margin: 0;
      padding: 0;
      display: flex;

      li {
        position: relative;
        bottom: -1px;
        display: block;
        margin: ${(p) => p.theme.marginPx.sm}px 0 0;

        a {
          display: block;
          padding: ${(p) => p.theme.marginPx.sm}px
            ${(p) => p.theme.marginPx.md}px;
          border: 1px solid transparent;
          border-bottom: none;
          border-top-left-radius: ${(p) => p.theme.sizing.borderRadiusMd};
          border-top-right-radius: ${(p) => p.theme.sizing.borderRadiusMd};
          text-decoration: none;
          cursor: pointer;
          color: ${(p) => p.theme.colors.textLink};

          &:hover {
            text-decoration: underline;
          }
        }

        &.${CLS.SELECTED} {
          a {
            border-color: ${(p) => p.theme.colors.panel.border};
            background: #fff;
            color: ${(p) => p.theme.colors.text};
          }
        }
      }
    }
  }

  &.${CLS.MODE.main} {
    background: ${(p) => p.theme.colors.panel.bg};
    padding: 0 ${(p) => p.theme.marginPx.md}px;
  }

  &.${CLS.MODE.section} {
    padding: 0 ${(p) => p.theme.marginPx.md}px;
  }
`;
