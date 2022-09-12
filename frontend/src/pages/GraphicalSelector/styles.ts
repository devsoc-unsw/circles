import styled from 'styled-components';

const Wrapper = styled.div`
  height: calc(100vh - var(--navbar-height));
  padding: 25px;
  display: flex;
  gap: 20px;
`;

const GraphPlaygroundWrapper = styled.div`
  height: 100%;
  border-radius: 20px;
  border: #C2C2C2 solid 1px;
  overflow: hidden;
  display: flex;
  flex: 5;
  position: relative;
  flex-direction: column-reverse;
  align-items: flex-start;
`;

const SidebarWrapper = styled.div`
  border-radius: 20px;
  border: #C2C2C2 solid 1px;
  padding: 10px;
  flex: 2;
`;

const SearchBarWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const ToolsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap:10px;
  margin-bottom: 10px;
  margin-left: 10px;
`;
export default {
  Wrapper,
  GraphPlaygroundWrapper,
  SidebarWrapper,
  SearchBarWrapper,
  ToolsWrapper,
};
