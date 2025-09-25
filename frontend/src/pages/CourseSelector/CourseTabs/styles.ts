import styled from 'styled-components';

const CourseTabsWrapper = styled.div`
  background-color: ${({ theme }) => theme.purpleLight};
  padding-left: 22px; /* width of menu sidebar, 2px is tab margin-left */
  width: 100vw;
  max-height: var(--cs-tabs-cont-height);
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const ShowAllCourses = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  margin-right: 125px;

  @media (max-width: 768px) {
    width: auto;
    margin-right: 16px;
    margin-top: 4px;
  }
`;

const TextShowCourses = styled.div`
  margin: 5px;
`;

const CourseTabsSection = styled.div`
  display: flex;
  overflow: auto;
  height: 100%;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 768px) {
    margin-top: 4px;
    max-height: 30px;
  }
`;

const TabsCloseAll = styled.div`
  margin: 0 15px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    margin-top: 8px;
  }
`;

export default {
  CourseTabsWrapper,
  CourseTabsSection,
  TabsCloseAll,
  ShowAllCourses,
  TextShowCourses
};
