import React, { Component } from 'react';
import { Text, Flex, Icon } from 'rimble-ui';
import styled from 'styled-components';

const ProductTime = styled(Flex)`
  position: absolute;
  right: 8px;
  top: 8px;
`;

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: null
    };
  }

  componentDidMount() {
    this.start();
  }

  componentDidUpdate(prevProps) {
    const { auction: { closeTime, openTime } } = this.props;

    if (openTime !== prevProps.auction.openTime || closeTime !== prevProps.auction.closeTime) {
      this.start();
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  secondsToTime(secs) {
    const hours = secs >= 0 ? Math.floor(secs / (60 * 60)) : 0;

    const divisor_for_minutes = secs % (60 * 60);
    const minutes = secs >= 0 ? Math.floor(divisor_for_minutes / 60) : 0;

    const divisor_for_seconds = divisor_for_minutes % 60;
    const seconds = secs >= 0 ? Math.ceil(divisor_for_seconds) : 0;

    return {
      hours,
      minutes,
      seconds
    };
  }

  start() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }

    this.intervalID = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    const { auction: { closeTime } } = this.props
    const current = Date.now() / 1000;
    const timestamp = closeTime - current;
    this.setState({
      time: this.secondsToTime(timestamp)
    });

    if (timestamp < 0) {
      clearInterval(this.intervalID);
    }
  }

  render() {
    const { time } = this.state;
    return time ? (
      <ProductTime>
        <Text mr={1}>{`${time.hours}:${time.minutes}:${time.seconds}`}</Text>
        <Icon name="Timer"></Icon>
      </ProductTime>
    ) : null;
  }
}

export default Timer;