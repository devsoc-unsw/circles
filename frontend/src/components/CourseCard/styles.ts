import { Button } from 'antd';
import styled, { css } from 'styled-components';

const CourseWrapper = styled.div`
  display: block;
  align-items: center;
`;

const CourseCode = styled.p`
  margin: 0 !important;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
`;

const CourseTitle = styled.p`
  margin: 0 !important;
  font-size: 14px;
  font-weight: 520;
  text-align: left;

  text-overflow: ellipsis;
  overflow: hidden;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const QuickCartButton = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`;

const CourseCard = styled(Button)<{ planned?: boolean }>`
  border-radius: 10px;
  border-width: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 271px;
  height: 80px;
  white-space: break-spaces;

  ${({ planned }) => !planned && css`
    background: #FAFAFA; 
    border-color: #DCDCDC;
    color: #000000 !important;

    &:hover {
      background-color: #F9F9F9;
    }
  `}
`;

export default {
  CourseWrapper,
  CourseCode,
  CourseTitle,
  QuickCartButton,
  CourseCard,
};
