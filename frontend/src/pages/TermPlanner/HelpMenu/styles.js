import styled from "styled-components";

const HelpMenuWrapper = styled.div`
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  grid-auto-rows: auto;
`;

const HeaderWrapper = styled.div`
  width: auto;
  grid-column-start: 1;
  grid-column-end: 3;
`;

const HelpGif = styled.img`
  width: 100%;
  image-rendering: auto;
  border-radius: 10px;
  transition: box-shadow 0.3s ease;

  &:hover {
    cursor: help;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  }
`;

export default { HelpMenuWrapper, HeaderWrapper, HelpGif };
