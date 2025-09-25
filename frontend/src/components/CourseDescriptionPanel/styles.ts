import { Typography } from 'antd';
import styled, { css } from 'styled-components';

const { Text } = Typography;

const Wrapper = styled.div<{ $sidebar?: boolean }>`
  width: 100%;
  padding: 10px;

  ${({ $sidebar }) =>
    $sidebar &&
    css`
      padding: 30px;
      display: flex;
      flex-direction: row;
      gap: 4rem;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 2rem;
        padding: 16px;
      }
    `}
`;

const MainWrapper = styled.div`
  flex-basis: 75%;
  flex-grow: 1;

  @media (max-width: 768px) {
    flex-basis: 100%;
  }
`;

const SidebarWrapper = styled.div`
  flex-basis: 25%;

  @media (max-width: 768px) {
    flex-basis: 100%;
  }
`;

const TitleWrapper = styled.div<{ $sidebar?: boolean }>`
  ${({ $sidebar }) =>
    $sidebar &&
    css`
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    `}
`;

const TextBlock = styled(Text)`
  display: block;
  color: ${({ theme }) => theme.graph.tabTextColor};
`;

export default {
  Wrapper,
  MainWrapper,
  SidebarWrapper,
  TitleWrapper,
  TextBlock
};
