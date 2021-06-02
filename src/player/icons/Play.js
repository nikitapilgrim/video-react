import React from 'react';
import { animated, Spring, useSpring } from 'react-spring';

export const IconPlay = (props) => {
  return (
    <svg
      width={14}
      height={18}
      viewBox="0 0 14 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1 1l12 8-12 8V1z"
        fill="#fff"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const IconPlayPause = React.forwardRef((props, ref) => {
  const { fill } = props;
  return (
    <animated.svg
      style={{ height: '100%', width: '100%', pointerEvents: 'none' }}
      preserveAspectRatio="xMinYMin meet"
      ref={ref}
      viewBox="0 0 24 36"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs>
        <animated.path
          fill={fill}
          id="prefix__a"
          d="M11 10h6v16h-6m9-16h6v16h-6"
        >
          <animate
            begin="indefinite"
            attributeType="XML"
            attributeName="d"
            fill="freeze"
            from="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26"
            to="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28"
            dur="0.1s"
            keySplines=".4 0 1 1"
            repeatCount={1}
          />
        </animated.path>
      </defs>
      <use xlinkHref="#prefix__a" className="prefix__ytp-svg-shadow" />
      <use xlinkHref="#prefix__a" className="prefix__ytp-svg-fill" />
    </animated.svg>
  );
});
