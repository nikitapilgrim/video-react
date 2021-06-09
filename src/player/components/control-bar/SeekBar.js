import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

import Slider from '../Slider';
import PlayProgressBar from './PlayProgressBar';
import LoadProgressBar from './LoadProgressBar';
import MouseTimeDisplay from './MouseTimeDisplay';
import { formatTime } from '../../utils';
import {VideoSeekSlider} from '../SeekSlider.tsx';

const propTypes = {
  player: PropTypes.object,
  mouseTime: PropTypes.object,
  actions: PropTypes.object,
  className: PropTypes.string,
};

export default class SeekBar extends Component {
  constructor(props, context) {
    super(props, context);

    this.getPercent = this.getPercent.bind(this);
    this.getNewTime = this.getNewTime.bind(this);
    this.stepForward = this.stepForward.bind(this);
    this.stepBack = this.stepBack.bind(this);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  componentDidMount() {}

  componentDidUpdate() {}

  /**
   * Get percentage of video played
   *
   * @return {Number} Percentage played
   * @method getPercent
   */
  getPercent() {
    const { currentTime, seekingTime, duration } = this.props.player;
    const time = seekingTime || currentTime;
    const percent = time / duration;
    return percent >= 1 ? 1 : percent;
  }

  getNewTime(event) {
    const {
      player: { duration },
    } = this.props;
    const distance = this.slider.calculateDistance(event);
    const newTime = distance * duration;

    // Don't let video end while scrubbing.
    return newTime === duration ? newTime - 0.1 : newTime;
  }

  handleMouseDown() {}

  handleMouseUp(event) {
    const { actions } = this.props;
    const newTime = this.getNewTime(event);
    // Set new time (tell video to seek to new time)
    actions.seek(newTime);
    actions.handleEndSeeking(newTime);
  }

  handleMouseMove(event) {
    const { actions } = this.props;
    const newTime = this.getNewTime(event);
    actions.handleSeekingTime(newTime);
  }

  stepForward() {
    const { actions } = this.props;
    actions.forward(5);
  }

  stepBack() {
    const { actions } = this.props;
    actions.replay(5);
  }

  getBufferedTime() {
    const {buffered, duration} = this.props.player
    if (!buffered || !buffered.length) {
      return 0;
    }
    let bufferedEnd = buffered.end(buffered.length - 1);
    if (bufferedEnd > duration) {
      bufferedEnd = duration;
    }
    return bufferedEnd;
  }

  render() {
    const {
      player: { currentTime, seekingTime, duration, buffered },
      manager,
      mouseTime,
      actions
    } = this.props;
    const time = seekingTime || currentTime;
    const progress = this.getBufferedTime();
    const player = this.props.player;
    const final =  Number(player.duration) &&
        player.duration > 0 &&
        player.duration === player.currentTime

    /*return (
      <Slider
        ref={(input) => {
          this.slider = input;
        }}
        label="video progress bar"
        progress={true}
        className={classNames(
          'video-react-progress-holder',
          this.props.className
        )}
        valuenow={(this.getPercent() * 100).toFixed(2)}
        valuetext={formatTime(time, duration)}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        getPercent={this.getPercent}
        stepForward={this.stepForward}
        stepBack={this.stepBack}
      >
        <LoadProgressBar
          buffered={buffered}
          currentTime={time}
          duration={duration}
        />
        {!manager.mobile ? (
          <MouseTimeDisplay duration={duration} mouseTime={mouseTime} />
        ) : (
          <></>
        )}

        <PlayProgressBar currentTime={time} duration={duration} />
      </Slider>
    );*/
    return (
        <VideoSeekSlider
            max={duration}
            currentTime={time}
            progress={progress}
            onChange={(time)=>{

              actions.handleEndSeeking(time);
              actions.seek(time);
              if (final) {
                actions.play();
              }

              /* this.setState({
                 currentTime:time
               });*/
            }}
            offset={0}
           /* secondsPrefix="00:00:"
            minutesPrefix="00:"*/
        />

    )
  }
}

SeekBar.propTypes = propTypes;
SeekBar.displayName = 'SeekBar';
