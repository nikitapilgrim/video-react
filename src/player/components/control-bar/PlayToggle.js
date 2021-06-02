import PropTypes from 'prop-types';
import React, {Component, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import { IconPlay, IconPlayPause } from '../../icons/Play';
import { IconPause } from '../../icons/Pause';
import { MorphReplace } from 'react-svg-morph';
import { Spring, animated, useSpring } from 'react-spring';
import { interpolate } from 'flubber';
import { tween } from 'popmotion';
import posed from 'react-pose';
import ReactTooltip from 'react-tooltip';
import { IconAgain } from '../../icons/Again';
import {usePlayer} from "../../components/Player";
import useHover from "@react-hook/hover";


const propTypes = {
  actions: PropTypes.object,
  player: PropTypes.object,
  className: PropTypes.string,
};

const paths = {
  on: 'M1 1l12 8-12 8V1z',
  off: 'M2 2v12M10 2v12',
};
const pathIds = Object.keys(paths);

const morphTransition = ({ from, to }) =>
  tween({
    from: 0,
    to: 1,
  }).pipe(interpolate(from, to));

const Icon = posed.path(
  pathIds.reduce((config, id) => {
    config[id] = {
      d: paths[id],
      transition: morphTransition,
      stroke: '#fff',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };

    return config;
  }, {})
);
const pause = 'M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26';
const play = 'M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28';
// M1 1l12 8-12 8V1z play
//M2 2v12M10 2v12 pause

/* stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"*/

export const AnimatedPlayPause = ({ player, isHovering }) => {
  const svg = useRef();
  const flip = useRef(true);
  const paused = useMemo(() => player.paused, [player.paused]);

  const { fill } = useSpring({
    fill: isHovering ? '#fff': '#d9d9d9',
  });
  /*const final = useMemo(() => {
    return (
        Number(player.duration) &&
        player.duration > 0 &&
        player.duration === player.currentTime
    );
  }, [player]);*/

  useEffect(() => {
    flip.current = !flip;
    if (svg.current) {
      const animation = svg.current.querySelector('animate');
      if (animation) {
        animation.setAttribute('from', paused ? pause : play);
        animation.setAttribute('to', paused ? play : pause);
        animation.beginElement();
      }
    }
  }, [paused]);
  return <IconPlayPause  fill={fill} ref={svg} />;
};

const isFinal = (player) =>
  Number(player.duration) &&
  player.duration > 0 &&
  player.duration === player.currentTime;

export default class PlayToggle extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      index: 0,
    };
  }

  handleClick() {
    const { actions, player } = this.props;
    console.log(player.paused)
    if (player.paused) {
      actions.play();
      this.setState((state) => ({
        index: 0,
      }));
    } else {
      actions.pause();
      this.setState((state) => ({
        index: 1,
      }));
    }
  }

  render() {
    const { player, className } = this.props;

    return (
      <>
        <Button ref={this.button} className={className} onClick={this.handleClick} player={player}/>
       {/* <ReactTooltip id="play" {...tooltip} multiline={true} />*/}
      </>
    );
  }
}

const textTooltip = (player) => {
  if (isFinal(player)) {
    return 'Повторить';
  }
  return player.paused ? 'Воспроизвести' : 'Пауза';
};

const Button = React.forwardRef(({player, onClick, className}, ref) => {
  const controlText = player.paused ? 'Play' : 'Pause';
  const {tooltip: {setActiveTooltip}} = usePlayer();
  const target = React.useRef(null)
  const isHovering = useHover(target, {enterDelay: 0, leaveDelay: 0})
  const tooltip = {
    place: 'top',
    type: 'dark',
    effect: 'solid',
    condition: false,
  };

  useEffect(() => {
    setActiveTooltip({name: 'playpause',state: isHovering,text: textTooltip(player)})
  }, [isHovering, player])

  return (
      <button

          /*data-for="play"
          data-tip={textTooltip()}
          data-iscapture="true"*/
          ref={target}
          className={classNames(className, {
            'video-react-play-control': true,
            'video-react-control': true,
            'video-react-button': true,
            'video-react-paused': player.paused,
            'video-react-playing': !player.paused,
          })}
          type="button"
          tabIndex="0"
          onClick={onClick}
      >
        {isFinal(player) ? (
            <IconAgain />
        ) : (
            <AnimatedPlayPause isHovering={isHovering} player={player} />
        )}
        <span className="video-react-control-text">{controlText}</span>
      </button
        >
  )
})

PlayToggle.propTypes = propTypes;
PlayToggle.displayName = 'PlayToggle';
