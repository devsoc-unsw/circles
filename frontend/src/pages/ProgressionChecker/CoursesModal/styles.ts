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
`;

const Instruction = styled.p`
  margin-top: 10px;
  margin-bottom: 0px;
  font-size: 18px;
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

const SortBtnWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
  margin-right: 15px;

  & > * {
    cursor: pointer;
    font-size: 1.25rem;
  }
`;

export default {
  ModalHeader,
  ModalTitle,
  Instruction,
  CourseModal,
  CourseList,
  SortBtnWrapper,
};
