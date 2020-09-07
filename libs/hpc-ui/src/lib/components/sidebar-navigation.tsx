import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '../theme';

const CLS = {
  MENU: 'menu',
  CONTENT: 'content',
};

interface Props {
  menu: Array<
    | {
        label: string;
        path: string;
      }
    | undefined
    | null
    | false
  >;
  children?: JSX.Element | JSX.Element[];
}

const Wrapper = styled.div`
  margin: ${(p) => p.theme.marginPx.sm}px -${(p) => p.theme.marginPx.sm}px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;

  > .${CLS.MENU} {
    flex-grow: 1;
    margin: ${(p) => p.theme.marginPx.sm}px;
    padding: 0;
    width: 250px;
    list-style: none;
    border: 1px solid ${(p) => p.theme.colors.panel.border};
    background: ${(p) => p.theme.colors.panel.bg};

    li {
      margin: 0;
      padding: 0;
      border-bottom: 1px solid ${(p) => p.theme.colors.panel.border};

      &:last-child {
        border-bottom: none;
      }

      a {
        display: block;
        padding: ${(p) => p.theme.marginPx.sm}px;

        &:hover {
          background: ${(p) => p.theme.colors.panel.bgHover};
        }
      }

      &.selected {
        a {
          background: ${(p) => p.theme.colors.panel.bgSelected};
        }
      }
    }
  }

  > .${CLS.CONTENT} {
    margin: ${(p) => p.theme.marginPx.sm}px;
    width: 500px;
    flex-grow: 100;
  }
`;

const SidebarNavigation = (props: Props) => {
  const { menu, children } = props;
  const loc = useLocation();

  return (
    <Wrapper>
      <ul className={CLS.MENU}>
        {menu.map(
          (m, i) =>
            m && (
              <li key={i} className={loc.pathname === m.path ? 'selected' : ''}>
                <Link to={m.path}>{m.label}</Link>
              </li>
            )
        )}
      </ul>
      <div className={CLS.CONTENT}>{children}</div>
    </Wrapper>
  );
};

export default SidebarNavigation;
