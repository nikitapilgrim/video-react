import PropTypes from 'prop-types';
import React, {Component, useContext, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import useHover from '@react-hook/hover';
import {useClickAway} from 'react-use';

import Manager from '../Manager';

import {TooltipMenu} from './TooltipMenu'
import BigPlayButton from './BigPlayButton';
import LoadingSpinner from './LoadingSpinner';
import PosterImage from './PosterImage';
import Video from './Video';
import Bezel from './Bezel';
import Shortcut from './Shortcut';
import ControlBar from './control-bar/ControlBar';

import * as browser from '../utils/browser';
import { focusNode } from '../utils/dom';
import { mergeAndSortChildren, isVideoChild, throttle } from '../utils';
import fullscreen from '../utils/fullscreen';
import useMobileDetect from 'use-mobile-detect-hook';
import {useDebouncedCallback} from "use-debounce";
import useMouse from '@react-hook/mouse-position'


const propTypes = {
  children: PropTypes.any,

  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fluid: PropTypes.bool,
  muted: PropTypes.bool,
  playsInline: PropTypes.bool,
  aspectRatio: PropTypes.string,
  className: PropTypes.string,
  videoId: PropTypes.string,

  startTime: PropTypes.number,
  loop: PropTypes.bool,
  autoPlay: PropTypes.bool,
  src: PropTypes.string,
  poster: PropTypes.string,
  preload: PropTypes.oneOf(['auto', 'metadata', 'none']),

  onLoadStart: PropTypes.func,
  onWaiting: PropTypes.func,
  onCanPlay: PropTypes.func,
  onCanPlayThrough: PropTypes.func,
  onPlaying: PropTypes.func,
  onEnded: PropTypes.func,
  onSeeking: PropTypes.func,
  onSeeked: PropTypes.func,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onProgress: PropTypes.func,
  onDurationChange: PropTypes.func,
  onError: PropTypes.func,
  onSuspend: PropTypes.func,
  onAbort: PropTypes.func,
  onEmptied: PropTypes.func,
  onStalled: PropTypes.func,
  onLoadedMetadata: PropTypes.func,
  onLoadedData: PropTypes.func,
  onTimeUpdate: PropTypes.func,
  onRateChange: PropTypes.func,
  onVolumeChange: PropTypes.func,

  store: PropTypes.object,
};

const defaultProps = {
  fluid: true,
  muted: false,
  playsInline: false,
  preload: 'auto',
  aspectRatio: 'auto',
};

const PlayerContext = React.createContext({});

export const usePlayer = () => {
  return useContext(PlayerContext);
};

const NewFunctionality = React.memo(
  React.forwardRef(({ player,playerRef, children, ...otherProps }, ref) => {
    const { onEnd, manager, actions } = otherProps;
    const video = useRef(otherProps.video);
    const detectMobile = useMobileDetect();
    const isHovering = useHover(ref, { enterDelay: 200, leaveDelay: 200 });
    const [activeTooltip, setActiveTooltip] = useState({});
    const [mouseMoved, setMouseMoved] = useState(false);
    const wait = useRef();



    useClickAway(playerRef, () => {
      //actions.userActivate(false);
    });

    useEffect(() => {
      video.current = otherProps.video;
    }, [otherProps.video])
    const {isOver, x, y} = useMouse(otherProps.video, {
      enterDelay: 200,
      leaveDelay: 200,
    })


    useEffect(() => {
      if (isOver) {
        setMouseMoved(true)
        if (wait.current) {
          clearTimeout(wait.current);
        }
        wait.current = setTimeout(() => {
          setMouseMoved(false)
        }, 3000)
      }
    }, [x, y, isOver])

    useEffect(() =>  {
      if (isOver) {
        actions.userActivate(mouseMoved);
      }
      if (!isOver && !manager.mobile) {
        actions.userActivate(isHovering);
      }
    }, [isOver,mouseMoved, manager.mobile, isHovering])




    useEffect(() => {
      if (
        typeof onEnd === 'function' &&
        player.ended &&
        player.currentTime === player.duration
      ) {
        onEnd();
      }
    }, [onEnd, player.currentTime, player.duration, player.ended]);


    return (
      <PlayerContext.Provider value={{ ...player, detectMobile, tooltip: {activeTooltip, setActiveTooltip}}}>
        {children}
      </PlayerContext.Provider>
    );
  })
);

export default class Player extends Component {
  constructor(props) {
    super(props);
    this.rootElement = React.createRef();
    this.controlsHideTimer = null;
    this.playerRef = React.createRef();
    this.video = null; // the Video component
    this.manager = new Manager(props.store);
    this.actions = this.manager.getActions();
    this.manager.subscribeToPlayerStateChange(
      this.handleStateChange.bind(this)
    );

    this.getStyle = this.getStyle.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.getChildren = this.getChildren.bind(this);
    this.handleMouseMove = throttle(this.handleMouseMove.bind(this), 250);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.startControlsTimer = this.startControlsTimer.bind(this);
    this.handleFullScreenChange = this.handleFullScreenChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    fullscreen.addEventListener(this.handleFullScreenChange);
  }

  componentWillUnmount() {
    // Remove event listener
    window.removeEventListener('resize', this.handleResize);
    fullscreen.removeEventListener(this.handleFullScreenChange);
    if (this.controlsHideTimer) {
      window.clearTimeout(this.controlsHideTimer);
    }
  }

  getDefaultChildren(originalChildren) {
    let children = [
      <Video
        ref={(c) => {
          this.video = c;
          this.manager.video = this.video;
        }}
        key="video"
        order={0.0}
      >
        {originalChildren}
      </Video>,
      /*<PosterImage key="poster-image" order={1.0} />,*/
      <LoadingSpinner key="loading-spinner" order={2.0} />,
      <Bezel key="bezel" order={3.0} />,
      /*<BigPlayButton key="big-play-button" order={4.0} />,*/
      /* <ControlBar key="control-bar" order={5.0} />,*/
      <Shortcut key="shortcut" order={99.0} />,
    ];
    if (!this.manager.mobile) {
      children.push(<ControlBar key="control-bar" order={5.0} />);
    }
    return children;
  }

  getChildren(props) {
    const {
      className: _, // remove className
      children: originalChildren,
      ...propsWithoutChildren
    } = props;
    const children = React.Children.toArray(this.props.children).filter(
      (e) => !isVideoChild(e)
    );
    const defaultChildren = this.getDefaultChildren(originalChildren);
    return mergeAndSortChildren(
      defaultChildren,
      children,
      propsWithoutChildren
    );
  }

  setWidthOrHeight(style, name, value) {
    let styleVal;
    if (typeof value === 'string') {
      if (value === 'auto') {
        styleVal = 'auto';
      } else if (value.match(/\d+%/)) {
        styleVal = value;
      }
    } else if (typeof value === 'number') {
      styleVal = `${value}px`;
    }
    Object.assign(style, {
      [name]: styleVal,
    });
  }

  getStyle() {
    const {
      fluid,
      aspectRatio: propsAspectRatio,
      height: propsHeight,
      width: propsWidth,
    } = this.props;
    const { player } = this.manager.getState();
    const style = {};
    let width;
    let height;
    let aspectRatio;

    // The aspect ratio is either used directly or to calculate width and height.
    if (propsAspectRatio !== undefined && propsAspectRatio !== 'auto') {
      // Use any aspectRatio that's been specifically set
      aspectRatio = propsAspectRatio;
    } else if (player.videoWidth) {
      // Otherwise try to get the aspect ratio from the video metadata
      aspectRatio = `${player.videoWidth}:${player.videoHeight}`;
    } else {
      // Or use a default. The video element's is 2:1, but 16:9 is more common.
      aspectRatio = '16:9';
    }

    // Get the ratio as a decimal we can use to calculate dimensions
    const ratioParts = aspectRatio.split(':');
    const ratioMultiplier = ratioParts[1] / ratioParts[0];

    if (propsWidth !== undefined) {
      // Use any width that's been specifically set
      width = propsWidth;
    } else if (propsHeight !== undefined) {
      // Or calulate the width from the aspect ratio if a height has been set
      width = propsHeight / ratioMultiplier;
    } else {
      // Or use the video's metadata, or use the video el's default of 300
      width = player.videoWidth || 400;
    }

    if (propsHeight !== undefined) {
      // Use any height that's been specifically set
      height = propsHeight;
    } else {
      // Otherwise calculate the height from the ratio and the width
      height = width * ratioMultiplier;
    }

    if (fluid) {
      style.paddingTop = `${ratioMultiplier * 100}%`;
    } else {
      // If Width contains "auto", set "auto" in style
      this.setWidthOrHeight(style, 'width', width);
      this.setWidthOrHeight(style, 'height', height);
    }

    return style;
  }

  // get redux state
  // { player, operation }
  getState() {
    return this.manager.getState();
  }

  // get playback rate
  get playbackRate() {
    return this.video.playbackRate;
  }

  // set playback rate
  // speed of video
  set playbackRate(rate) {
    this.video.playbackRate = rate;
  }

  get muted() {
    return this.video.muted;
  }

  set muted(val) {
    this.video.muted = val;
  }

  get volume() {
    return this.video.volume;
  }

  set volume(val) {
    this.video.volume = val;
  }

  // video width
  get videoWidth() {
    return this.video.videoWidth;
  }

  // video height
  get videoHeight() {
    return this.video.videoHeight;
  }

  // play the video
  play() {
    this.video.play();
  }

  // pause the video
  pause() {
    this.video.pause();
  }

  // Change the video source and re-load the video:
  load() {
    this.video.load();
  }

  // Add a new text track to the video
  addTextTrack(...args) {
    this.video.addTextTrack(...args);
  }

  // Check if your browser can play different types of video:
  canPlayType(...args) {
    this.video.canPlayType(...args);
  }

  // seek video by time
  seek(time) {
    this.video.seek(time);
  }

  // jump forward x seconds
  forward(seconds) {
    this.video.forward(seconds);
  }

  // jump back x seconds
  replay(seconds) {
    this.video.replay(seconds);
  }

  // enter or exist full screen
  toggleFullscreen() {
    this.video.toggleFullscreen();
  }

  // subscribe to player state change
  subscribeToStateChange(listener) {
    return this.manager.subscribeToPlayerStateChange(listener);
  }

  // player resize
  handleResize() {}

  handleFullScreenChange(event) {
    if (event.target === this.manager.rootElement) {
      this.actions.handleFullscreenChange(fullscreen.isFullscreen);
    }
  }

  handleMouseDown() {
    this.startControlsTimer();
  }

  handleMouseMove() {
    this.startControlsTimer();
  }

  handleKeyDown() {
    this.startControlsTimer();
  }

  startControlsTimer() {
    let controlBarActiveTime = 100000;
    React.Children.forEach(this.props.children, (element) => {
      if (!React.isValidElement(element) || element.type !== ControlBar) {
        return;
      }

      const { autoHideTime } = element.props;
      if (typeof autoHideTime === 'number') {
        controlBarActiveTime = autoHideTime;
      }
    });

    /*this.actions.userActivate(true);
    clearTimeout(this.controlsHideTimer);
    this.controlsHideTimer = setTimeout(() => {
      this.actions.userActivate(false);
    }, controlBarActiveTime);*/
  }

  handleStateChange(state, prevState) {
    if (state.isFullscreen !== prevState.isFullscreen) {
      this.handleResize();
      // focus root when switching fullscreen mode to avoid confusion #276
      focusNode(this.manager.rootElement);
    }
    this.forceUpdate(); // re-render
  }

  handleFocus() {
    this.actions.activate(true);
  }

  handleBlur() {
    this.actions.activate(false);
  }

  render() {
    const { fluid } = this.props;
    const { player } = this.manager.getState();
    const {
      paused,
      hasStarted,
      waiting,
      seeking,
      isFullscreen,
      userActivity,
    } = player;

    const props = {
      ...this.props,
      player,
      actions: this.actions,
      manager: this.manager,
      store: this.manager.store,
      video: this.video ? this.video.video : null,
    };
    const children = this.getChildren(props);

    return (
      <NewFunctionality playerRef={this.playerRef} ref={this.rootElement} {...props} player={player}>
        <div
          className={classNames(
            {
              'video-react-controls-enabled': true,
              'video-react-has-started': true, //hasStarted,
              'video-react-paused': paused,
              'video-react-mobile': this.manager.mobile,
              'video-react-playing': !paused,
              'video-react-waiting': waiting,
              'video-react-seeking': false, //seeking waiting,
              'video-react-fluid': fluid,
              'video-react-fullscreen': isFullscreen,
              'video-react-user-inactive': !userActivity,
              'video-react-user-active': userActivity,
              'video-react-workinghover': !browser.IS_IOS,
            },
            'video-react',
            this.props.className
          )}
          style={this.getStyle()}
          ref={(el) => {
            this.manager.rootElement = el;
            this.rootElement = el
            this.playerRef.current = el
          }}
          role="region"
          onTouchStart={this.handleMouseDown}
          onMouseDown={this.handleMouseDown}
          onTouchMove={this.handleMouseMove}
          onMouseMove={this.handleMouseMove}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          tabIndex="-1"
        >
          {children}
        </div>
      </NewFunctionality>
    );
  }
}

Player.contextTypes = { store: PropTypes.object };
Player.propTypes = propTypes;
Player.defaultProps = defaultProps;
Player.displayName = 'Player';
