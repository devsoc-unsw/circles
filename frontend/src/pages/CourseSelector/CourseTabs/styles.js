import styled from "styled-components";

const CourseTabsWrapper = styled.div`
  background-color: ${({ theme }) => theme.purpleLight};
  padding-left: calc(2vw - 2px); // 20vw - width of menu sidebar, 2px is tab margin-left
  padding-right: 25px;
  width: 100vw;
  height: var(--cs-tabs-cont-height);
  display: flex;
  align-items: center;
`;

const ShowAllCourses = styled.div`
  display: flex;
  align-items: center;
  postion: absolute;
  left: 20px;
  width: calc(18vw - 2px); // Added calc(18vw - 2px) so the width of the toggle switch changes when the viewport is changed.
`;

const TextShowCourses = styled.div`
  margin: 5px;
  padding-bottom: 2px;
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

export default { CourseTabsWrapper, CourseTabsSection, TabsCloseAll, ShowAllCourses, TextShowCourses};
