import styled, { css } from "styled-components";
import { Droppable } from "../common/styles";

const TermBoxWrapper = styled.ul`
  margin: 1em;
  min-height: 18em;
  min-width: 20em;
  color: white;
  list-style: none;
  padding: 1.2em;
  border-radius: 2em;
  transition: 200ms ease-out;
  border: 0.5px solid #d9d9d9;
  position: relative;

  ${({ droppable }) => droppable && Droppable}

  ${({ summerEnabled }) => summerEnabled && css`
    margin: 0.5em;
    min-height: 18em;
    min-width: 15em;
    padding: 1em;
    padding-top: 0.5em;
    border-radius: 1em;
  `}

  ${({ isSmall }) => isSmall && css`
    min-width: 12em;
    min-height: 14em;
    border-radius: 1em;
  `}

  ${({ isSmall, summerEnabled }) => isSmall && summerEnabled && css`
    min-height: 13.5em;
    min-width: 13em;
  `}
`;

const TermCheckboxWrapper = styled.div`
  background-color: ${({ checked }) => (checked ? "#9685f3" : "#D9D9D9")};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  padding-top: 3.5px;
  transition: all 200ms ease;

  &:hover {
    cursor: pointer;
    color: #bfbbbb;
    background-color: ${({ checked }) => (checked ? "#b4a9f4" : "#bfbbbb")};
  }
`;

const UOCWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

export default { TermBoxWrapper, TermCheckboxWrapper, UOCWrapper };
