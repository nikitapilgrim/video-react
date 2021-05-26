import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import { formatTime } from '../../utils';
import { usePlayer } from '../../components/Player';

function MouseTimeDisplay({ duration, mouseTime, className, text }) {
  const player = usePlayer();
  const isMobile = player.detectMobile.isMobile();
  if (!mouseTime.time) {
    return null;
  }

  const time = text || formatTime(mouseTime.time, duration);

  return (
    <>
      {!isMobile && (
        <div
          className={classNames('video-react-mouse-display', className)}
          style={{
            transform: `translateX(${mouseTime.position}px)`,
          }}
          data-current-time={time}
        >
          <span className={'video-react-time-progress'}>{time}</span>
        </div>
      )}
    </>
  );
}

MouseTimeDisplay.propTypes = {
  duration: PropTypes.number,
  mouseTime: PropTypes.object,
  className: PropTypes.string,
};
MouseTimeDisplay.displayName = 'MouseTimeDisplay';

export default MouseTimeDisplay;
