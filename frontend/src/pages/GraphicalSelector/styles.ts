import styled from 'styled-components';
import CourseDescriptionPanelComp from 'components/CourseDescriptionPanel';

const Wrapper = styled.div`
  height: calc(100vh - var(--navbar-height));
  padding: 25px;
  display: flex;
  gap: 20px;
`;

const GraphPlaygroundWrapper = styled.div`
  height: 100%;
  border-radius: 20px;
  border: #c2c2c2 solid 1px;
  overflow: hidden;
  flex: 5;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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

const ToolsWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CourseDescriptionPanel = styled(CourseDescriptionPanelComp)`
  & h3.ant-typography {
    font-size: 20px !important;
  }

  & h2.ant-typography {
    font-size: 26px !important;
  }
`;

export default {
  CourseDescriptionPanel,
  Wrapper,
  GraphPlaygroundWrapper,
  SidebarWrapper,
  SearchBarWrapper,
  ToolsWrapper
};
