import { Tag as antdTag } from 'antd';
import styled, { css } from 'styled-components';

const Wrapper = styled.div<{ concise?: boolean; }>`
  width: 100%;
  padding: 10px;
  
  ${({ concise }) => !concise && css`
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

const TitleWrapper = styled.div<{ concise?: boolean; }>`
  ${({ concise }) => !concise && css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `}
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
  MainWrapper,
  SidebarWrapper,
  TitleWrapper,
  TermWrapper,
  MiscInfo,
  MiscInfoChild,
  SkeletonWrapper,
  Tag,
};
