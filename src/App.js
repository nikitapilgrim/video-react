import logo from './logo.svg';
import React from 'react';
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  ReplayControl,
  BigPlayButton,
  ForwardControl,
  FinalScreen,
  MobileControls,
} from './player';
import useMobileDetect from 'use-mobile-detect-hook';
import {useWindowSize} from "@react-hook/window-size";
//import demo from './player/demo/demo.mp4'
const demo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const App = () => {
  const detectMobile = useMobileDetect();
  const isMobile = detectMobile.isMobile();
  const style = isMobile ? {} : { width: '100%', margin: '0 auto' };

    const [width, height] = useWindowSize()

    return (
      <div style={style}>
        <Player
            width={width}
            height={height}
            fluid={false}
            autoPlay={true}
            preload={'auto'}
            playsInline
            src={demo}
        >
          <FinalScreen />
          {/*<BigPlayButton position="center" />*/}
          {isMobile && <MobileControls />}
          {!isMobile && (
              <ControlBar>
                <ReplayControl seconds={10} order={3} />
                <PlaybackRateMenuButton
                    order={4}
                    rates={[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]}
                />
                <ForwardControl seconds={10} order={5} />
              </ControlBar>
          )}
        </Player>
      </div>
  );
};

export default App;
