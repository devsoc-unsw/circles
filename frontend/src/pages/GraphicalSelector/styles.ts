import { Button } from 'antd';
import styled, { css } from 'styled-components';
import CourseDescriptionPanelComp from 'components/CourseDescriptionPanel';

const Wrapper = styled.div<{ $fullscreen: boolean; $isMobile?: boolean }>`
  height: calc(100vh - var(--navbar-height));
  display: flex;
  gap: 20px;

  ${({ $fullscreen, $isMobile }) =>
    !$fullscreen &&
    css`
      padding: ${$isMobile ? '10px' : '25px'};
    `}

  ${({ $isMobile }) =>
    $isMobile &&
    css`
      flex-direction: column;
      gap: 0;
    `}
`;

const GraphWrapper = styled.div<{ $fullscreen: boolean; $isMobile?: boolean }>`
  height: 100%;
  width: 100%;
  overflow: hidden;
  flex: 5;
  position: relative;

  ${({ $fullscreen, $isMobile }) =>
    !$fullscreen &&
    css`
      border-radius: ${$isMobile ? '15px' : '20px'};
      border: ${({ theme }) => theme.graph.borderColor} solid 1px;
    `}

  ${({ $isMobile }) =>
    $isMobile &&
    css`
      height: calc(100vh - var(--navbar-height) - 20px);
      min-height: 500px;
    `}
`;

const SidebarWrapper = styled.div`
  border-radius: 20px;
  border: ${({ theme }) => theme.graph.borderColor} solid 1px;
  padding: 10px;
  flex: 2;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.graph.backgroundColor};
`;

const SearchBarWrapper = styled.div<{ $isMobile?: boolean }>`
  position: absolute;
  top: ${({ $isMobile }) => ($isMobile ? '10px' : '20px')};
  right: ${({ $isMobile }) => ($isMobile ? '10px' : '20px')};
  left: ${({ $isMobile }) => ($isMobile ? '10px' : 'auto')};
  z-index: 10;

  ${({ $isMobile }) =>
    $isMobile &&
    css`
      .ant-select {
        .ant-select-selector {
          border-radius: 8px;
          padding: 8px 12px;
          height: 44px;
          font-size: 16px;
        }
      }
    `}
`;

const CourseDescriptionPanel = styled(CourseDescriptionPanelComp)`
  & h3.ant-typography {
    font-size: 20px !important;
  }

  & h2.ant-typography {
    font-size: 26px !important;
  }
`;

const SpinnerWraper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const MobileMenuButton = styled(Button)`
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: linear-gradient(135deg, #9254de 0%, #b37feb 100%);

  &.ant-btn {
    height: 56px;
    width: 56px;
    border-radius: 50%;
    padding: 0;
    line-height: 1;
  }

  .anticon {
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
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
