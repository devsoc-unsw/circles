import { Button } from 'antd';
import styled from 'styled-components';
import CourseDescriptionPanelComp from 'components/CourseDescriptionPanel';

const Wrapper = styled.div`
  height: calc(100vh - var(--navbar-height));
  display: flex;
  gap: 1.25rem;
  padding: 25px;
  @media (max-width: 800px) {
    flex-direction: column;
    gap: 0;
    padding: 10px;
  }
`;

const GraphWrapper = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  flex: 5;
  position: relative;
  border-radius: 1.25rem;
  border: ${({ theme }) => theme.graph.borderColor} solid 1px;

  @media (max-width: 800px) {
    height: calc(100vh - var(--navbar-height) - 20px);
    min-height: 500px;
    border: none;
    border-radius: 0;
  }
`;

const SidebarWrapper = styled.div`
  border-radius: 1.25rem;
  border: ${({ theme }) => theme.graph.borderColor} solid 1px;
  padding: 1rem;
  flex-grow: 2;
  flex-shrink: 0;
  flex-basis: 10rem;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.graph.backgroundColor};

  @media (max-width: 800px) {
    display: none;
  }
`;

const SearchBarWrapper = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;

  @media (max-width: 800px) {
    width: 100%;
    right: 0;
    top: 0.75rem;
    padding: 0 1rem;
  }
`;

const CourseDescriptionPanel = styled(CourseDescriptionPanelComp)``;

const SpinnerWraper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const MobileMenuButton = styled(Button)`
  display: none;

  @media (max-width: 800px) {
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
