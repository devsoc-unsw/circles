import styled, { css } from "styled-components";
import { shake } from "../common/styles";

const CourseWrapper = styled.li`
  user-select: none;
  font-size: 0.8rem;
  cursor: grab;
  padding: 0.9em;
  padding-right: 1.1em;
  padding-left: 1.1em;
  border-radius: ${({ isSmall }) => (isSmall ? "0.2em" : "1em")};
  max-width: 20em;
  min-width: 12em;
  margin-top: 1em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.7em;
  line-height: 1.5715;
  background-color: ${({ theme }) => theme.draggableCourse.backgroundColor}; 

  ${({ isSmall }) => isSmall && css`
    border-radius: 1.25em;
    padding: 0.8em;
    width: 10em;
  `}

  ${({ summerEnabled, isSmall }) => summerEnabled && isSmall && css`
    width: 8em;
  `}

  ${({ warningsDisabled }) => warningsDisabled && css`
    background-color: #fff3e0;
  `}

  ${({ warning }) => warning && css`
    background-color: ${({ theme }) => theme.draggableCourse.warningBackgroundColor}; 
  `}

  ${({ dragDisabled }) => dragDisabled && css`
    background-color: ${({ theme }) => theme.draggableCourse.dragDisabledBackgroundColor};

    &:hover {
      animation: ${shake} 0.25s;
      transform: none;
      cursor: not-allowed;
    }
  `}
`;

const CourseLabel = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: 0px;
  margin: 0px;
`;

export default {
  CourseWrapper, CourseLabel,
};
