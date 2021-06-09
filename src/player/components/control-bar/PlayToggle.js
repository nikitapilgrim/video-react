import PropTypes from 'prop-types';
import React, {Component, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import { IconPlay, IconPlayPause } from '../../icons/Play';
import { IconPause } from '../../icons/Pause';
import { Spring, animated, useSpring } from 'react-spring';
import { IconAgain } from '../../icons/Again';
import {usePlayer} from "../../components/Player";
import useHover from "@react-hook/hover";
import { useLottie } from "lottie-react";
import playanim from "../../animations/play.json";


const propTypes = {
  actions: PropTypes.object,
  player: PropTypes.object,
  className: PropTypes.string,
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

  const options = {
    animationData: playanim,
    loop: false,
    autoplay: false
  };
  const { View,animationItem, goToAndStop, goToAndPlay,  playSegments} = useLottie(options);
  const svgPaths = useRef([])

  useEffect(() => {
    if (svgPaths.current.length === 0) {
      if (animationItem && animationItem.hasOwnProperty('renderer')) {
        const svg = animationItem.renderer.svgElement;
        svgPaths.current = svg.querySelectorAll("path");
        svgPaths.current.forEach(p => {
          p.setAttribute("stroke", '#d9d9d9');
          p.setAttribute("fill", '#d9d9d9');
        })
      }
    }
  },[animationItem])

  const { fill } = useSpring({
    fill: isHovering ? '#fff': '#d9d9d9',
    onChange: ({value}) => {
      svgPaths.current.forEach(p => {
        p.setAttribute("stroke", value.fill);
        p.setAttribute("fill", value.fill);
      })
    }
  });

  useEffect(() => {
    setActiveTooltip({name: 'playpause',state: isHovering,text: textTooltip(player)})
  }, [isHovering, player])



  useEffect(() => {
    if (animationItem) {
      const {markers} = animationItem;
      const playStart = markers[0];
      const playStop = markers[1];
      const pauseStart = markers[2];
      const pauseStop = markers[3];
      const seg1 = [playStart.time, playStop.time];
      const seg2 = [pauseStart.time, pauseStop.time];

      if (player.paused) {
        playSegments(seg2, true)
      }
      if (!player.paused) {
        playSegments(seg1, true)
      }
    }

  }, [player.paused, animationItem])


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
            <>{View}</>
        )}
        <span className="video-react-control-text">{controlText}</span>
      </button
        >
  )
})

PlayToggle.propTypes = propTypes;
PlayToggle.displayName = 'PlayToggle';
