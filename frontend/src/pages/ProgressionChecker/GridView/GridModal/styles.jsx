import { Modal, Typography } from "antd";
import styled from "styled-components";

const { Title } = Typography;

const ModalHeader = styled.div`
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`;

const ModalTitle = styled(Title)`
  && {
    margin: 0 !important;
  }
`;

const Instruction = styled.p`
  margin-top: 10px;
  margin-bottom: 0px;
`;

// const CourseSection = styled()

const CourseModal = styled(Modal)`
  top: 0;
  float: right;
  margin: 20px;
  .ant-modal-content, .ant-modal-header {
    border-radius: 20px;
  }
`;

export default {
  ModalHeader,
  ModalTitle,
  Instruction,
  CourseModal,
};
