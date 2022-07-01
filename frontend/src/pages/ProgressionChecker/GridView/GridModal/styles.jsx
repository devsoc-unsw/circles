import { Modal, Typography } from "antd";
import styled from "styled-components";
import GRID from "../styles";

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

const CourseModal = styled(Modal)`
  top: 0px;
  margin: 30px;
  float: right;
  .ant-modal-content, .ant-modal-header {
    border-radius: 20px;
  }
`;

const CourseList = styled(GRID.CourseGroup)`
  padding-top: 10px;
  padding-bottom: 10px;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

export default {
  ModalHeader,
  ModalTitle,
  Instruction,
  CourseModal,
  CourseList,
};
