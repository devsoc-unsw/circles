import styled, { css } from 'styled-components';

const Wrapper = styled.div<{ open?: boolean }>`
  position: absolute;
  height: 85%;
  width: 30rem;

  top: 5rem;

  background-color: white;
  border-radius: 10px 0 0 10px;
  /* box-shadow: -3px 3px 8px 2px rgba(0, 0, 0, 0.3); */
  z-index: 1000;
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
          /* right: 0rem; */
        `
      : css`
          animation-name: animation_closed;
          /* right: -30rem; */
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
  padding: 1rem;

  overflow-y: auto;
  overflow-x: hidden;
`;

const ArrowWrapper = styled.div`
  height: 40%;
  width: 2rem;
  padding-left: 0.5rem;

  position: absolute;
  left: -2rem;
  top: 30%;
  background-color: white;

  border-radius: 10px 0 0 10px;
  cursor: pointer;
  /* box-shadow: -3px 3px 8px 2px rgba(0, 0, 0, 0.3); */

  :hover {
    background-color: rgba(255, 255, 255, 0.9);
  }
`;

export default {
  Wrapper,
  ChildrenWrapper,
  ArrowWrapper
};
