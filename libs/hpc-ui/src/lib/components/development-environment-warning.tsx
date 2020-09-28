import React from 'react';

import { CLASSES, combineClasses } from '../classes';
import { styled } from '../theme';
import { MdWarning } from 'react-icons/md';

interface Props {
  className?: string;
  message: string;
}

const DevEnvWarning = (props: Props) => {
  const { className, message } = props;

  return (
    <div className={className}>
      <div
        className={combineClasses(
          CLASSES.CONTAINER.FLUID,
          CLASSES.FLEX.CONTAINER
        )}
      >
        <MdWarning size={20} />
        <span>{message}</span>
        <MdWarning size={20} />
      </div>
    </div>
  );
};

const HEIGHT = '40px';

export default styled(DevEnvWarning)`
  height: ${HEIGHT};
  width: 100%;

  > div {
    width: 100%;
    height: ${HEIGHT};
    position: fixed;
    z-index: 1000;
    background: ${(p) => p.theme.colors.pallete.red.dark};
    color: #fff;
    text-align: center;
    justify-content: center;
    border-bottom: 1px solid #fff;

    span {
      margin: 0 ${(p) => p.theme.marginPx.md}px;
    }
  }
`;
