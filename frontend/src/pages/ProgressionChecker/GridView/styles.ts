import styled from 'styled-components';

const TitleSortWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SortBtnWrapper = styled.div`
  display: flex;
  gap: 15px;

  & > * {
    cursor: pointer;
    font-size: 1.25rem;
  }
`;

const CourseGroup = styled.div`
  min-width: 70%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
`;

const ViewAllCoursesWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const NotesText = styled.div`
  font-size: 1rem;
  margin-bottom: 20px;
`;

export default {
  TitleSortWrapper,
  SortBtnWrapper,
  CourseGroup,
  ViewAllCoursesWrapper,
  NotesText,
};
