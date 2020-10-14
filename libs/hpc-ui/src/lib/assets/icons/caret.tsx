import React from 'react';

import { combineClasses } from '../../classes';
import { styled } from '../../theme';

const CLS_DIRECTION = {
  down: 'direction-down',
  up: 'direction-up',
  end: 'direction-end',
  start: 'direction-start',
} as const;

type Props = Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'width' | 'height'> & {
  direction?: keyof typeof CLS_DIRECTION;
  size?: number;
};

const Svg = styled.svg`
  &.${CLS_DIRECTION.up} {
    transform: rotate(180deg);
  }

  &.${CLS_DIRECTION.end} {
    transform: rotate(270deg);

    [dir='rtl'] & {
      transform: rotate(90deg);
    }
  }

  &.${CLS_DIRECTION.start} {
    transform: rotate(90deg);

    [dir='rtl'] & {
      transform: rotate(270deg);
    }
  }
`;

const Caret = (props: Props) => {
  props = { ...props };
  const direction = props.direction || 'down';
  // Set a defauly size if it isn't set
  if (!props.size) {
    props.size = 6.6;
  }
  props.className = combineClasses(CLS_DIRECTION[direction], props.className);
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1.764 1.058"
      width={props.size}
      {...props}
    >
      <path
        d="M1.764.15A.151.151 0 001.72.046a.143.143 0 00-.209 0L.884.69.253.045a.143.143 0 00-.209 0 .153.153 0 000 .215l.734.753c.058.06.15.06.208 0L1.72.26a.167.167 0 00.044-.11z"
        fill="currentColor"
      />
    </Svg>
  );
};

export default Caret;
