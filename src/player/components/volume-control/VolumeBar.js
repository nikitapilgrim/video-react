import PropTypes from 'prop-types';
import React, {Component, useRef, useEffect} from 'react';
import classNames from 'classnames';
import SliderInput from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '../Slider';
import VolumeLevel from './VolumeLevel';
import {useDebounce, useDebounceCallback} from "@react-hook/debounce";

const propTypes = {
  actions: PropTypes.object,
  player: PropTypes.object,
  className: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

class VolumeBar extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      percentage: '0%'
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handlePercentageChange = this.handlePercentageChange.bind(this);
    this.checkMuted = this.checkMuted.bind(this);
    this.getPercent = this.getPercent.bind(this);
    this.stepForward = this.stepForward.bind(this);
    this.stepBack = this.stepBack.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {}

  handleChange(event, newValue) {
    const { player, actions } = this.props;
    this.checkMuted();
    actions.changeVolume(newValue/ 100);
   /* this.setState({
      volume: newValue,
    });*/
    //setState(newValue);
  }

  getPercent() {
    const { player } = this.props;
    if (player.muted) {
      return 0;
    }
    return player.volume;
  }

  checkMuted() {
    const { player, actions } = this.props;

    if (player.muted) {
      actions.mute(false);
    }
    if (player.volume === 0) {
      actions.mute(true);
    }
  }

  handleMouseMove(event) {
    const { actions } = this.props;
    this.checkMuted();
    const distance = this.slider.calculateDistance(event);
    actions.changeVolume(distance);
  }

  stepForward() {
    const { player, actions } = this.props;
    this.checkMuted();
    actions.changeVolume(player.volume + 0.1);
  }

  stepBack() {
    const { player, actions } = this.props;
    this.checkMuted();
    actions.changeVolume(player.volume - 0.1);
  }

  handleFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  handleBlur(e) {
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  handlePercentageChange(percentage) {
    if (percentage !== this.state.percentage) {
      this.setState({
        percentage,
      });
    }
  }

  handleClick(event) {
    event.stopPropagation();
  }

  render() {
    const { player, className } = this.props;
    const volume = (player.volume * 100).toFixed(2);
    return (
      <CustomSlider
        value={volume}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />

      /*<Slider
        ref={(c) => {
          this.slider = c;
        }}
        label="volume level"
        valuenow={volume}
        valuetext={`${volume}%`}
        onMouseMove={this.handleMouseMove}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onClick={this.handleClick}
        sliderActive={this.handleFocus}
        sliderInactive={this.handleBlur}
        getPercent={this.getPercent}
        onPercentageChange={this.handlePercentageChange}
        stepForward={this.stepForward}
        stepBack={this.stepBack}
        {...this.props}
        className={classNames(
          className,
          'video-react-volume-bar video-react-slider-bar'
        )}
      >
        <VolumeLevel {...this.props} />
      </Slider>*/
    );
  }
}

const CustomSlider = ({onChange, onFocus, onBlur, value}) => {
 // const [value, setValue] = useDebounce(100, 2000)
  const state = useRef(0)
  const handleOnChange = (event, newValue) => {
    onChange(event, newValue)
  }

  const handleBlur = () => {
    console.log('blur')
    onBlur()
  }

  const handleFocus = () => {
    console.log('focus')

    onFocus()
  }

  return (
      <SliderInput
          className={'react-player__slider'}
          onMouseDown={handleFocus}
          onChangeCommitted={(e) => {
            handleBlur()
          }}
          value={Number(value)}
          onChange={handleOnChange}
          aria-labelledby="continuous-slider"
          /*  onFocus={this.handleFocus}
            onBlur={this.handleBlur}*/
      />
  )
}

VolumeBar.propTypes = propTypes;
VolumeBar.displayName = 'VolumeBar';

export default VolumeBar;
