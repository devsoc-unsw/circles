import styled from 'styled-components';

const CourseTabsWrapper = styled.div`
  background-color: ${({ theme }) => theme.purpleLight};
  width: 100%;
  height: var(--cs-tabs-cont-height);
  display: flex;
  align-items: center;
  flex-wrap: nowrap; // Prevent the items from wrapping
  justify-content: flex-start;
`;

const ShowAllCourses = styled.div`
  background-color: ${({ theme }) => theme.purpleLight};
  display: flex;
  flex-direction: row;
  align-items: center;
  width: calc(14vw - 2px);
`;

const TextShowCourses = styled.div`
  margin: 5px;
  white-space: nowrap;
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
  margin: 0 1rem;
`;

export default {
  CourseTabsWrapper,
  CourseTabsSection,
  TabsCloseAll,
  ShowAllCourses,
  TextShowCourses
};
