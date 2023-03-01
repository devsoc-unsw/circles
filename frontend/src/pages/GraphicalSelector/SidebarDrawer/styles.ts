import styled, { css } from 'styled-components';

const Wrapper = styled.div<{ open?: boolean }>`
  position: absolute;
  height: 85%;
  width: 30rem;

  top: 5rem;

  background-color: white;
  border-radius: 10px 0 0 10px;
  filter: drop-shadow(-2px 2px 4px rgba(0, 0, 0, 0.3));

  animation-duration: 0.7s;
  animation-fill-mode: forwards;
  ${({ open }) =>
    open === undefined
      ? css`
          right: -30rem;
        `
      : open
      ? css`
          animation-name: animation_open;
        `
      : css`
          animation-name: animation_closed;
        `}

  @keyframes animation_open {
    from {
      right: -30rem;
    }
    to {
      right: 0;
    }
  }

  @keyframes animation_closed {
    from {
      right: 0;
    }
    to {
      right: -30rem;
    }
  }
`;

const ChildrenWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px 20px;

  overflow-y: auto;
  overflow-x: hidden;
`;

const ArrowWrapper = styled.div`
  height: 40%;
  width: 2rem;

  position: absolute;
  left: -2rem;
  top: 30%;
  background-color: white;

  border-radius: 10px 0 0 10px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    background: #f0f0f0;
  }
`;

const SVGWrapper = styled.svg`
  width: 12px;
  height: 48px;
`;

const SVGLine = styled.line`
  stroke-linecap: round;
  stroke-width: 2px;
  stroke: #aaa;
`;

export default {
  Wrapper,
  ChildrenWrapper,
  ArrowWrapper,
  SVGLine,
  SVGWrapper
};
