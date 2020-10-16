import React from 'react';
import { IconBaseProps } from 'react-icons/lib';

const User = (props: IconBaseProps) => {
  props = { ...props };
  if (props.size) {
    props.height = props.size;
  } else if (!props.height && !props.width) {
    props.height = 10;
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 10" {...props}>
      <path
        d="M4.47059 5.22727H3.52941C1.57647 5.22727 0 6.75 0 8.63636V10H8V8.63636C8 6.75 6.42353 5.22727 4.47059 5.22727Z"
        fill="currentColor"
      />
      <path
        d="M4.0004 4.54545C5.2999 4.54545 6.35334 3.52792 6.35334 2.27273C6.35334 1.01753 5.2999 0 4.0004 0C2.70091 0 1.64746 1.01753 1.64746 2.27273C1.64746 3.52792 2.70091 4.54545 4.0004 4.54545Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default User;
