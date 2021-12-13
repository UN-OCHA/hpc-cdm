import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '../theme';
import { IconType } from 'react-icons/lib';

const CLS = {
  SELECTED: 'selected',
};

export interface SidebarNavigationItem {
  label: string;
  path: string;
  icon?: {
    icon: IconType;
    color?: string;
    title?: string;
  };
}

interface Props {
  menu: Array<SidebarNavigationItem | undefined | null | false>;
  children?: JSX.Element | JSX.Element[];
}

const Wrapper = styled.div`
  margin: ${(p) => p.theme.marginPx.md}px -1rem 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
`;

const Menu = styled.ul`
  flex-grow: 1;
  margin: 0 1rem;
  padding: 0;
  width: 250px;
  list-style: none;

  li {
    margin: 0;
    padding: 0;
    border-bottom: 1px solid ${(p) => p.theme.colors.pallete.gray.light4};

    a {
      position: relative;
      display: flex;
      align-items: center;
      height: ${(p) => p.theme.sizing.singleLineBlockItemHeightPx}px;
      font-size: 1.6rem;
      color: ${(p) => p.theme.colors.pallete.gray.light};

      &:hover {
        text-decoration: none;
        background: ${(p) => p.theme.colors.pallete.gray.light5};
        color: ${(p) => p.theme.colors.pallete.gray.normal};
      }

      &::before {
        content: '';
        display: block;
        width: 4px;
        height: 16px;
      }

      > span {
        flex-basis: 0;
        flex-grow: 1;
        margin: 0 18px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    &.${CLS.SELECTED} a {
      font-weight: 500;
      color: ${(p) => p.theme.colors.pallete.gray.normal};

      &::before {
        background-color: ${(p) => p.theme.colors.secondary.normal};
      }
    }
  }
`;

const Content = styled.div`
  margin: 0 1rem;
  width: 500px;
  flex-grow: 100;
`;

const SidebarNavigation = (props: Props) => {
  const { menu, children } = props;
  const loc = useLocation();

  return (
    <Wrapper>
      <Menu>
        {menu.map(
          (m, i) =>
            m && (
              <li
                key={i}
                className={loc.pathname === m.path ? CLS.SELECTED : ''}
              >
                <Link
                  title={
                    m.icon?.title ? `${m.label}: ${m.icon.title}` : m.label
                  }
                  to={m.path}
                >
                  <span>{m.label}</span>
                  {m.icon && (
                    <m.icon.icon
                      size={24}
                      color={m.icon.color}
                      title={m.icon.title}
                    />
                  )}
                </Link>
              </li>
            )
        )}
      </Menu>
      <Content>{children}</Content>
    </Wrapper>
  );
};

export default SidebarNavigation;
