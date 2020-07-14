import React from 'react';
import styled from 'styled-components';

import { CLASSES, combineClasses } from './classes';
import UNOCHA from './icons/logos/unocha';

interface Props {
  className?: string;
}

const Header = (props: Props) => {
  const { className } = props;
  return (
    <nav
      className={combineClasses(
        className,
        CLASSES.CONTAINER.FLUID,
        CLASSES.FLEX.CONTAINER
      )}
    >
      <UNOCHA className="logo" />
      <div className={CLASSES.FLEX.GROW} />
    </nav>
  );
};

export default styled(Header)`
  background: #026cb6;
  background-image: linear-gradient(-180deg, #026cb6 67%, #025995 97%);
  min-height: 40px;

  .logo {
    width: 30px;
  }
`;
