import { Modal, Typography } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;

const ModalHeader = styled.div`
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`;

const ModalTitle = styled(Title)`
  margin: 0 !important;
  color: ${({ theme }) => theme.text} !important;
`;

const Instruction = styled.p`
  margin-top: 10px;
  margin-bottom: 0px;
  font-size: 18px;
  color: ${({ theme }) => theme.text};
`;

const CourseModal = styled(Modal)`
  top: 0px;
  margin: 30px;
  float: right;
`;

const CourseList = styled.div`
  min-width: 70%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

const FilterBarWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  margin-right: 15px;
  & > :not(:first-child) {
    cursor: pointer;
    font-size: 1.25rem;
  }
`;

const PlaceholderWrapper = styled.div`
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 1rem;
`;

export default {
  ModalHeader,
  ModalTitle,
  Instruction,
  CourseModal,
  CourseList,
  FilterBarWrapper,
  PlaceholderWrapper
};
