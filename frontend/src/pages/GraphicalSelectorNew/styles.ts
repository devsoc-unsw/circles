import styled from 'styled-components';
import CourseDescriptionPanelComp from 'components/CourseDescriptionPanel';

const Wrapper = styled.div`
  height: calc(100vh - var(--navbar-height));
  padding: 25px;
  display: flex;
  gap: 20px;
`;

const GraphWrapper = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 20px;
  border: #c2c2c2 solid 1px;
  overflow: hidden;
  flex: 5;
  position: relative;
`;

const SidebarWrapper = styled.div`
  border-radius: 20px;
  border: #c2c2c2 solid 1px;
  padding: 10px;
  flex: 2;
  overflow-y: auto;
`;

const SearchBarWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
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

export default {
  CourseDescriptionPanel,
  Wrapper,
  GraphWrapper,
  SidebarWrapper,
  SearchBarWrapper,
  SpinnerWraper
};
