import { Button as antdButton, Input as antdInput, Modal as antdModal } from 'antd';
import styled from 'styled-components';

const EditMarkWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LetterGradeWrapper = styled.div`
  display: flex;
  margin-top: 0.4em;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const Input = styled(antdInput)`
  width: 100%;
  background-color: ${({ theme }) => theme.editMark.backgroundColor};
  color: ${({ theme }) => theme.editMark.color};
  border-color: ${({ theme }) => theme.editMark.borderColor};
`;

const Button = styled(antdButton)`
  background-color: ${({ theme }) => theme.editMark.backgroundColor};
  color: ${({ theme }) => theme.editMark.color};
  border-color: ${({ theme }) => theme.editMark.borderColor};
  &:hover {
    background-color: ${({ theme }) => theme.editMark.backgroundColor};
  }
`;

// NOTE: Very hacky way to override modal styling
const Modal = styled(antdModal)`
  .ant-modal-footer {
    border: 0px;
  }
  .ant-modal-header {
    border-color: ${({ theme }) => theme.editMark.borderColorHeader};
  }
  .ant-btn-default {
    background-color: ${({ theme }) => theme.editMark.backgroundColor};
    border-color: ${({ theme }) => theme.editMark.borderColor};
    color: ${({ theme }) => theme.editMark.color};
  }
`;

export default { EditMarkWrapper, LetterGradeWrapper, Input, Button, Modal };
