import PropTypes from 'prop-types';
import React, {Component, useEffect} from 'react';
import { IconForward } from '../../icons/Forward';
import { IconBack } from '../../icons/Back';
import ReactTooltip from 'react-tooltip';
import {usePlayer} from "../../components/Player";
import useHover from "@react-hook/hover";
import classNames from "classnames";
import {useSpring} from "react-spring";

const propTypes = {
  actions: PropTypes.object,
  className: PropTypes.string,
  seconds: PropTypes.oneOf([5, 10, 30]),
};

const defaultProps = {
  seconds: 10,
};

export default (mode) => {
  class ForwardReplayControl extends Component {
    constructor(props, context) {
      super(props, context);
      this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
      const { actions, seconds, player } = this.props;
      // Depends mode to implement different actions
      if (mode === 'forward') {
        actions.forward(seconds);
      } else {
        actions.replay(seconds);
      }
      if (player.paused) {
        actions.play();
      }
    }

    render() {
      const { seconds, className, manager } = this.props;

      return (
        <>
          <Button
              seconds={seconds}
              className={className}
              manager={manager}
              mode={mode}
            ref={(c) => {
              this.button = c;
            }}
            type="button"
            onClick={this.handleClick}
          />
        </>
      );
    }
  }


  const Button = React.forwardRef(({player, onClick, children, mode, seconds, className, manager}, ref) => {
    const {tooltip: {setActiveTooltip}} = usePlayer();
    const target = React.useRef(null)
    const isHovering = useHover(target, {enterDelay: 0, leaveDelay: 0})
    const textTooltip = () => {
      if (mode === 'replay') {
        return 'На 10 секунд назад';
      }
      if (mode === 'forward') {
        return 'На 10 секунд вперед';
      }
    };
    const { fill } = useSpring({
      ///fill: muted ? '#27AE60' : '#fff',
      fill: isHovering ? '#fff': '#d9d9d9',
    });

    const classNames = [
      'video-react-control',
      'video-react-button',
      'video-react-icon',
    ];
    classNames.push(
        `video-react-icon-${mode}-${seconds}`,
        `video-react-${mode}-control`
    );
    if (className) {
      classNames.push(className);
    }

    useEffect(() => {
      setActiveTooltip({name: 'forwardreplay'+mode,state: isHovering,text: textTooltip(), target})
    }, [isHovering])

    return (
        <button
            ref={target}
            className={classNames.join(' ')}
            type="button"
            onClick={onClick}
        >
          {mode === 'forward' && <IconForward fill={fill} />}
          {mode === 'replay' && <IconBack fill={fill} />}

          <span className="video-react-control-text">{`${mode} ${seconds} seconds`}</span>
        </button>
    )
  })

  ForwardReplayControl.propTypes = propTypes;
  ForwardReplayControl.defaultProps = defaultProps;
  return ForwardReplayControl;
};
