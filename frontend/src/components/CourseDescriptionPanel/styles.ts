import { Typography } from 'antd';
import styled, { css } from 'styled-components';

const { Text } = Typography;

const Wrapper = styled.div<{ $sidebar?: boolean }>`
  width: 100%;
  padding: 0.6rem;

  ${({ $sidebar }) =>
    $sidebar &&
    css`
      padding: 1.9rem;
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

const Link = styled.a`
  color: ${({ theme }) => theme.courseMenu?.hrefColor};
  &:hover {
    color: ${({ theme }) => theme.courseMenu?.hrefHoverColor};
  }
`;

const RatingWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const DialWrapper = styled.div`
  text-align: center;
  width: 85px;
`;

const DialLabel = styled.p`
  font-size: small;
`;

// Flex wrapper for the header section
const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
`;

// Padding for the bottom section of planner
const PlannerWrapper = styled.div`
  padding-bottom: 0.8rem;
`;

export default {
  Wrapper,
  MainWrapper,
  SidebarWrapper,
  TitleWrapper,
  TextBlock,
  Link,
  RatingWrapper,
  DialWrapper,
  DialLabel,
  HeaderWrapper,
  PlannerWrapper
};
