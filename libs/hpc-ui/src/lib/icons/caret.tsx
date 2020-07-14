import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {
  direction?: 'down' | 'up';
}

export default (props: Props) => {
  if (props.direction === 'up') {
    props = {
      ...props,
      style: {
        ...props.style,
        transform: 'rotate(180deg)',
      },
    };
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2.646 2.646"
      width={10}
      {...props}
    >
      <path d="M2.237.53l-.914 1.585L.408.531z" fill="currentColor" />
    </svg>
  );
};
