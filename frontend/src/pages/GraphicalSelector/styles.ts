import { Button } from 'antd';
import styled, { css } from 'styled-components';
import CourseDescriptionPanelComp from 'components/CourseDescriptionPanel';

const Wrapper = styled.div<{ $fullscreen: boolean }>`
  height: calc(100vh - var(--navbar-height));
  display: flex;
  gap: 1.25rem;

  ${({ $fullscreen }) =>
    !$fullscreen &&
    css`
      padding: 25px;

      @media (max-width: 800px) {
        padding: 10px;
      }
    `}

  @media (max-width: 800px) {
    flex-direction: column;
    gap: 0;
  }
`;

const GraphWrapper = styled.div<{ $fullscreen: boolean }>`
  height: 100%;
  width: 100%;
  overflow: hidden;
  flex: 5;
  position: relative;

  ${({ $fullscreen, theme }) =>
    !$fullscreen &&
    css`
      border-radius: 1.25rem;
      border: ${theme.graph.borderColor} solid 1px;
    `}

  @media (max-width: 800px) {
    height: calc(100vh - var(--navbar-height) - 20px);
    min-height: 500px;
  }
`;

const SidebarWrapper = styled.div`
  border-radius: 1.25rem;
  border: ${({ theme }) => theme.graph.borderColor} solid 1px;
  padding: 10px;
  flex-grow: 2;
  flex-shrink: 0; /* prevent shrinking */
  flex-basis: 10rem; /* base width equal to min-width */
  overflow-y: auto;
  background-color: ${({ theme }) => theme.graph.backgroundColor};
`;

const SearchBarWrapper = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;

const CourseDescriptionPanel = styled(CourseDescriptionPanelComp)`
  & h3.ant-typography {
    font-size: 1.25rem;
  }

  & h2.ant-typography {
    font-size: 26px;
  }
`;

const SpinnerWraper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const MobileMenuButton = styled(Button)`
  display: none;

  @media (max-width: 800px) {
    /* show on mobile */
    display: flex;
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 10;
    height: 56px;
    width: 56px;
    min-width: 56px;
    border-radius: 50%;
    font-size: 22px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: linear-gradient(135deg, #9254de 0%, #b37feb 100%);

    .anticon {
      color: white;
    }
  }
`;

export default {
  CourseDescriptionPanel,
  Wrapper,
  GraphWrapper,
  SidebarWrapper,
  SearchBarWrapper,
  SpinnerWraper,
  MobileMenuButton
};
