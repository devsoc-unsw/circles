import styled from "styled-components";

const CourseTabsWrapper = styled.div`
  background-color: #efdbff;
  padding-left: calc(20vw - 2px); // 20vw - width of menu sidebar, 2px is tab margin-left
  padding-right: 25px;
  width: 100vw;
  height: var(--cs-tabs-cont-height);
  display: flex;
  align-items: center;
`;

const CourseTabsSection = styled.div`
  display: flex;
  overflow: auto;
  height: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabsCloseAll = styled.div`
  margin: 0 15px;
`;

export default { CourseTabsWrapper, CourseTabsSection, TabsCloseAll };
