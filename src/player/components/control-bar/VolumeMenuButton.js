import PropTypes from 'prop-types';
import React, {Component, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import PopupButton from '../popup/PopupButton';
import VolumeBar from '../volume-control/VolumeBar';
import { IconVolume, IconVolumeOff, IconVolumeTwo } from '../../icons/Volume';
import { animated, Spring, useSpring } from 'react-spring';
import ReactTooltip from 'react-tooltip';
import useHover from '@react-hook/hover'
import {usePlayer} from "../../components/Player";
import {useClickAway, useHoverDirty} from 'react-use';
import {useLottie} from "lottie-react";
import sound from "../../animations/sound.json";


const tooltip = {
  place: 'top',
  type: 'dark',
  effect: 'solid',
  condition: false,
};

const Volume = ({ player, onClick, onFocus }) => {
  const [index, setIndex] = useState(0);
  const target = React.useRef(null)
  const isHovering = useHover(target, {enterDelay: 0, leaveDelay: 0})
  const muted = useMemo(() => player.muted, [player]);
  const volume = useMemo(() => player.volume, [player]);
  const {tooltip: {setActiveTooltip}} = usePlayer();

  const options = {
    animationData: sound,
    loop: false,
    autoplay: false
  };
  const { View,animationItem, goToAndStop, goToAndPlay,  playSegments} = useLottie(options);

  const svgPaths = useRef([])

  useEffect(() => {
    if (animationItem) {
      const {markers} = animationItem;
      const SoundStart = markers[0];
      const SoundStop = markers[1];
      const SoundOffStart = markers[2];
      const SoundOffStop = markers[3];
      const seg1 = [SoundStart.time, SoundStop.time];
      const seg2 = [SoundOffStart.time, SoundOffStop.time];

      if (muted) {
        playSegments(seg1, true)
      }
      if (!muted) {
        playSegments(seg2, true)
      }
    }

  }, [muted, animationItem])

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

  /*
    const { opacity: opacityMuted } = useSpring({
      opacity: muted ? 1 : 0,
    });
    const { opacity: opacityVolume } = useSpring({
      opacity: volume > 0.1 && !muted ? 1 : 0,
    });*/

  useEffect(() => {
    if (isHovering) {
      onFocus();
    }
  }, [isHovering])

  useEffect(() => {
    if (player.muted) {
      setIndex(0);
    }
    if (!player.muted) {
      setIndex(1);
    }
  }, [player]);

  useEffect(() => {
    setActiveTooltip({name: 'volume',state: isHovering,text: player.muted ? 'Включить звук' : 'Отключение звука'})
  }, [isHovering, player.muted])

  return (
    <>
      <div
          ref={target}
          onClick={onClick}
        data-for="play"
        data-tip={player.muted ? 'Включить звук' : 'Отключение звука'}
        className={'video-react-volume'}
      >
        {/*<svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <animated.path
            d="M11 5L6 9H2v6h4l5 4V5z"
            fill={fill}
            stroke={fill}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          off
          <animated.path
            d="M22 9l-6 6M16 9l6 6"
            stroke={fill}
            fill={fill}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={opacityMuted}
          />

          волны
          <animated.path
            d="M19 5a10 10 0 010 14M16 8a5 5 0 010 8"
            stroke={fill}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={opacityVolume}
          />
        </svg>*/}
        <>{View}</>

        {/*{player.muted ? (
        <IconVolumeOff key={'voluneoff'} />
      ) : (
        <IconVolume key={'volumeon'} />
      )}*/}
      </div>
      {/*<ReactTooltip id="volume" {...tooltip} multiline={true} />*/}
    </>
  );
};

const propTypes = {
  player: PropTypes.object,
  actions: PropTypes.object,
  vertical: PropTypes.bool,
  className: PropTypes.string,
  alwaysShowVolume: PropTypes.bool,
};

const defaultProps = {
  vertical: false,
};

class VolumeMenuButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  get volumeLevel() {
    const {
      player: { volume, muted },
    } = this.props;
    let level = 3;
    if (volume === 0 || muted) {
      level = 0;
    } else if (volume < 0.33) {
      level = 1;
    } else if (volume < 0.67) {
      level = 2;
    }
    return level;
  }

  handleClick() {
    const { player, actions } = this.props;
    actions.mute(!player.muted);
  }

  handleFocus() {
    this.setState({
      active: true,
    });
  }

  handleBlur() {
    this.setState({
      active: false,
    });
  }

  render() {
    const { vertical, player, className } = this.props;
    const inline = !vertical;
    const level = this.volumeLevel;
    return (
      <PopupButton
        component={<Volume  onFocus={this.handleFocus} onClick={this.handleClick} player={player} />}
        className={classNames(
          className,
          {
            'video-react-volume-menu-button-vertical': vertical,
            'video-react-volume-menu-button-horizontal': !vertical,
            'video-react-vol-muted': player.muted,
            'video-react-vol-0': level === 0 && !player.muted,
            'video-react-vol-1': level === 1,
            'video-react-vol-2': level === 2,
            'video-react-vol-3': level === 3,
            'video-react-slider-active':
              this.props.alwaysShowVolume /*|| !this.props.outsideClicked*/ || this.state.active,
            'video-react-lock-showing':
              this.props.alwaysShowVolume /*|| !this.props.outsideClicked*/ || this.state.active,
          },
          'video-react-volume-menu-button'
        )}

        onClick={ () => void 0}
        /*onClick={this.handleClick}*/
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        inline={inline}
      >
        <VolumeBar
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          {...this.props}
        />
      </PopupButton>
    );
  }
}


export const HookLogic = (props) => {
 const [isActive, setIsActive] = useState();
 const ref = useRef();

  const handleClick = useCallback(() => {
   setIsActive(true)
 }, [])

 useEffect(() => {
   const flyoutElement = document.querySelector(".video-react-volume-menu-button");
   if (flyoutElement) {
     ref.current = flyoutElement;
     flyoutElement.addEventListener('click', handleClick)
     return () => {
       flyoutElement.removeEventListener('click', handleClick)
     }
   }
 }, [])

  useClickAway(ref, () => {
    setIsActive(false)
  });


  return (
      <VolumeMenuButton outsideClicked={isActive} {...props}/>
  )
}


VolumeMenuButton.propTypes = propTypes;
VolumeMenuButton.defaultProps = defaultProps;
VolumeMenuButton.displayName = 'VolumeMenuButton';
export default HookLogic;
