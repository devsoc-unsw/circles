import styled, { css, keyframes } from 'styled-components';

const waveAnimation = keyframes`
  0%, {margin-left: 0;}
  100% {margin-left: -1600px;}
`;

const waveSwell = keyframes`
  0%, 100% {
    transform: translate3d(0,-30px,0);
  }
  50% {
    transform: translate3d(0,5px,0);
  }
`;

const waveStyle = css`
  animation-fill-mode: backwards;
  width: 6400px;
  height: 916px;
  position: absolute;
`;

const WaveForeground = styled.div`
  ${waveStyle}
  background: url('src/assets/landingHero/wave3.svg') repeat-x;
  animation: ${waveAnimation} 5s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite,
    ${waveSwell} 5s ease -1.25s infinite;
  top: -10px;
`;

const WaveBackground = styled.div`
  ${waveStyle}
  background: url('src/assets/landingHero/wave4.svg') repeat-x;
  animation: ${waveAnimation} 5s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  transform: translate3d(0, 0, 0);
  top: -33px;
`;

const WaveWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  height: 1000px;
  position: absolute;
  z-index: -99;
  overflow-x: hidden;
`;

export default {
  WaveForeground,
  WaveBackground,
  WaveWrapper
};
