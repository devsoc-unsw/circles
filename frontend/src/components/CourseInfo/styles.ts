import styled, { css } from 'styled-components';

const Wrapper = styled.div<{ concise?: boolean }>`
  width: 100%;
  padding: 10px;

  ${({ concise }) =>
    !concise &&
    css`
      padding: 30px;
      display: flex;
      flex-direction: row;
      gap: 4rem;
    `}
`;

const MainWrapper = styled.div`
  flex-basis: 75%;
  flex-grow: 1;
`;

const SidebarWrapper = styled.div`
  flex-basis: 25%;
`;

const TitleWrapper = styled.div<{ concise?: boolean }>`
  ${({ concise }) =>
    !concise &&
    css`
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    `}
`;

export default {
  Wrapper,
  MainWrapper,
  SidebarWrapper,
  TitleWrapper
};
