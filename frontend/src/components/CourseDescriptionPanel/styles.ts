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
    `}
`;

const MainWrapper = styled.div`
  flex-basis: 75%;
  flex-grow: 1;
`;

const SidebarWrapper = styled.div`
  flex-basis: 25%;
`;

const TitleWrapper = styled.div<{ $sidebar?: boolean }>`
  ${({ $sidebar }) =>
    $sidebar &&
    css`
      align-items: center;
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

export default {
  Wrapper,
  MainWrapper,
  SidebarWrapper,
  TitleWrapper,
  TextBlock,
  Link,
  RatingWrapper,
  DialWrapper,
  DialLabel
};
