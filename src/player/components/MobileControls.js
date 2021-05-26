import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import useMobileDetect from 'use-mobile-detect-hook';

import { AnimatedPlayPause } from '../components/control-bar/PlayToggle';
import { usePlayer } from '../components/Player';
import { IconBack } from '../icons/Back';
import { IconForward } from '../icons/Forward';
import { IconPlay } from '../icons/Play';
import { IconPause } from '../icons/Pause';
import { IconAgain } from '../icons/Again';
import ControlBar from './control-bar/ControlBar';
import { ForwardControl, PlaybackRateMenuButton, ReplayControl } from '../';

export const MobileControls = ({ actions, ...other }) => {
  const player = usePlayer();
  const [active, setActive] = useState(false);
  const final = useMemo(() => {
    return (
      Number(player.duration) &&
      player.duration > 0 &&
      player.duration === player.currentTime
    );
  }, [player]);

  const Button = useMemo(() => {
    if (final) {
      return IconAgain;
    }
    if (player.paused) {
      return IconPlay;
    }
    return IconPause;
  }, [player, final]);

  const handleOnClickBack = () => {
    actions.replay(10);
  };
  const handleOnClickForward = () => {
    actions.forward(10);
  };

  const handleOnClickTrigger = () => {
    setActive((prev) => !prev);
    actions.userActivate(true);
  };

  useEffect(() => {
    if ((!player.userActivity && !player.paused) || final) {
      setActive(false);
    }
  }, [player.userActivity, player.paused, final]);

  const handleOnClickPlayPause = () => {
    if (player.paused) {
      actions.play();
    } else {
      actions.pause();
    }
  };
  /* {
    'video-react-mobile-control-hide':
    !other.manager.mobile || !player.userActivity || final,
  }*/
  return (
    <div
      /*style={{ opacity: player.userActivity ? 1 : 0 }}*/
      className={classNames('video-react-mobile-control')}
    >
      <div
        onClick={handleOnClickTrigger}
        className={'video-react-mobile-control__trigger'}
      />
      <div
        className={classNames('video-react-mobile-control__content', {
          'video-react-mobile-control__content_hide': !active,
        })}
      >
        <div className={'video-react-mobile-control__inner'}>
          <button
            onClick={handleOnClickBack}
            className="video-react-mobile-control__back"
          >
            <IconBack />
          </button>
          <button
            onClick={handleOnClickPlayPause}
            className="video-react-mobile-control__playpause"
          >
            <Button />
          </button>
          <button
            onClick={handleOnClickForward}
            className="video-react-mobile-control__forward"
          >
            <IconForward />
          </button>
        </div>
        <ControlBar {...other} actions={actions}>
          <PlaybackRateMenuButton
            {...other}
            actions={actions}
            order={4}
            rates={[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]}
          />
        </ControlBar>
      </div>
    </div>
  );
};
