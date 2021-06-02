import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import { useDebouncedCallback } from 'use-debounce';


export const MobileControls = ({ actions, ...other }) => {
  const player = usePlayer();
  const [active, setActive] = useState(true);
  const timer = useRef();
  const final = useMemo(() => {
    return (
      Number(player.duration) &&
      player.duration > 0 &&
      player.duration === player.currentTime
    );
  }, [player]);
  const [topPanelActive, setTopPanelActive] = useState(true);

  useEffect(() => {
    if (final) {
      setTopPanelActive(true)
    }
    if (!final) {
      setTimeout(() => {
        setTopPanelActive(false)
      }, 500)
    }
  }, [final]);



  const debounced = useDebouncedCallback(
      // function
      ({player, final}) => {
        if (!player.paused && !player.seeking) {
          setActive(false);
        }
        if (final) {
          setActive(true)
        }
      },
      // delay in ms
      200
  );


  useEffect(() => {
    debounced({player, final})
  }, [player.paused, player.seeking, final])

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
    if (!final){
      setActive((prev) => !prev);
    }
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
        <div className={classNames('video-react-mobile-control__inner', {'video-react-mobile-control__inner_hide': topPanelActive})}>
          <button
            onClick={handleOnClickBack}
            className="video-react-mobile-control__back"
          >
            <IconBack fill={'#fff'} />
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
            <IconForward fill={'#fff'}/>
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
