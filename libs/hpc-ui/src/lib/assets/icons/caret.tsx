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
      viewBox="0 0 1.764 1.058"
      width={6.6}
      {...props}
    >
      <path
        d="M1.764.15A.151.151 0 001.72.046a.143.143 0 00-.209 0L.884.69.253.045a.143.143 0 00-.209 0 .153.153 0 000 .215l.734.753c.058.06.15.06.208 0L1.72.26a.167.167 0 00.044-.11z"
        fill="currentColor"
      />
    </svg>
  );
};
