import React from 'react';
import { Link } from 'react-router-dom';

import { styled } from '../theme';
import { CLASSES, combineClasses } from '../classes';

const CLS = {
  CHILDREN: 'children',
  INNER: 'inner',
  SELECTED: 'selected',
};

interface Props {
  className?: string;
  tabs: Array<{
    path: string;
    label: string;
    selected: boolean;
  }>;
  children: JSX.Element[] | JSX.Element;
}

const Component = (props: Props) => (
  <div
    role="navigation"
    className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
  >
    <div className={combineClasses(CLS.INNER)}>
      <div className={combineClasses(CLS.CHILDREN, CLASSES.FLEX.GROW)}>
        {props.children}
      </div>
      <ul>
        {props.tabs.map((tab, i) => (
          <li key={i} className={tab.selected ? CLS.SELECTED : ''}>
            <Link to={tab.path}>
              <span>{tab.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default styled(Component)`
  border-bottom: 1px solid ${(p) => p.theme.colors.panel.border};
  background: ${(p) => p.theme.colors.panel.bg};

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
          color: ${(p) => p.theme.colors.primary.dark2};

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
`;
