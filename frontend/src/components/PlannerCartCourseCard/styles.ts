import styled from 'styled-components';

const CourseCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  border-radius: 10px;

  &:hover {
    background-color: ${(props) => (props.theme.plannerCartCard.backgroundColorHover)};
  }
`;

export default { CourseCardWrapper };
