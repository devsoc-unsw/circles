import { Tag as antdTag } from 'antd';
import styled, { css } from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  padding: 10px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TermWrapper = styled.div`
  margin-top: 20px;
`;

const MiscInfo = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

const MiscInfoChild = styled.div`
  padding: 16px 4px;
  flex: 1 1 0;
  text-align: center;

  &:nth-child(2) {
    border-left: #d9d9d9c0 solid 1px;
    border-right: #d9d9d9c0 solid 1px;
  }
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  gap: 20px;
`;

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && css`
    background: ${theme.courseTag.backgroundColor};
  `}

  &.clickable:hover {
    cursor: pointer;
  }
`;

export default {
  Wrapper,
  TitleWrapper,
  TermWrapper,
  MiscInfo,
  MiscInfoChild,
  SkeletonWrapper,
  Tag,
};
