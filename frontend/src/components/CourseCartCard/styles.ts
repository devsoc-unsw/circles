import styled from 'styled-components';

const CourseCardWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;

  &:hover {
    background-color: ${(props) => props.theme.plannerCartCard.backgroundColorHover};
    cursor: pointer;
    transition: all 0.2s ease;
  }
`;

export default { CourseCardWrapper };
