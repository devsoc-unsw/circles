import RightOutlined from '@ant-design/icons/RightOutlined';
import styled, { css } from 'styled-components';

const CollapsibleHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  vertical-align: bottom;
  border-bottom: #d9d9d9c0 solid 1px; //grey-5
  margin-top: 10px;
  margin-bottom: 7px;
  transition: 250ms;

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.purplePrimary};
    transition: 250ms;
  }
`;

const CollapseButton = styled(RightOutlined)<{ collapsed: boolean }>`
  margin-bottom: 10px;
  padding: 10px;
  transition: 200ms;
  transform: rotate(90deg);

  ${({ collapsed }) => collapsed && css`
    transform: rotate(0);
  `}
`;

const CollapsibleContent = styled.div<{ collapsed: boolean }>`
  transition: 250ms;
  width: 100%;
  padding-left: 35px;
  padding-right: 35px;

  ${({ collapsed }) => collapsed && css`
    height: 0px;
    opacity: 0px;
    display: none;
    transition: 250ms;
    width: 100%;
  `}
`;

export default { CollapsibleHeader, CollapsibleContent, CollapseButton };
