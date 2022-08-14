import styled from 'styled-components';

const GridViewContainer = styled.div`
  padding: 2em;
`;

const CourseGroup = styled.div`
  min-width: 70%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const ViewAllCoursesWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

export default {
  GridViewContainer,
  CourseGroup,
  ViewAllCoursesWrapper,
};
