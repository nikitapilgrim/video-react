import PropTypes from 'prop-types';
import React, {Component, useEffect} from 'react';
import classNames from 'classnames';
import { FullscreenOff, IconFullscreen } from '../../icons/Fullscreen';
import ReactTooltip from 'react-tooltip';
import {usePlayer} from "../../components/Player";
import useHover from "@react-hook/hover";


const propTypes = {
  actions: PropTypes.object,
  player: PropTypes.object,
  className: PropTypes.string,
};

const Fullscreen = ({ player }) => {
  return (
    <div className={'fullscreen-icon-svg'}>
      {!player.isFullscreen ? <IconFullscreen /> : <FullscreenOff />}
    </div>
  );
};

export default class FullscreenToggle extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { player, actions, manager } = this.props;
    actions.toggleFullscreen(player);
  }

  render() {
    const { player, className, manager } = this.props;
    const tooltip = {
      place: 'top',
      type: 'dark',
      effect: 'solid',
      condition: false,
    };
    return (
      <>
        <Button
            player={player}
          className={classNames(
            className,
            {
              'video-react-icon-fullscreen-exit': player.isFullscreen,
              'video-react-icon-fullscreen': !player.isFullscreen,
            },
            'video-react-fullscreen-control video-react-control video-react-button video-react-icon'
          )}
          ref={(c) => {
            this.button = c;
          }}
          type="button"
          tabIndex="0"
          onClick={this.handleClick}
        />
      </>
    );
  }
}


const Button = React.forwardRef(({player, onClick, className}, ref) => {
  const {tooltip: {setActiveTooltip}} = usePlayer();
  const target = React.useRef(null)
  const isHovering = useHover(target, {enterDelay: 0, leaveDelay: 0})

  useEffect(() => {
    setActiveTooltip({name: 'fullscreen',state: isHovering,text:  player.isFullscreen
          ? 'Выход из полноэкранного режима'
          : 'Во весь экран'})
  }, [isHovering, player.paused, player.duration, player.currentTime])

  return (
      <button
          className={className}
          ref={target}
          type="button"
          tabIndex="0"
          onClick={onClick}
      >
        <Fullscreen player={player} />
        <span className="video-react-control-text">Non-Fullscreen</span>
      </button>
  )
})

FullscreenToggle.propTypes = propTypes;
FullscreenToggle.displayName = 'FullscreenToggle';
