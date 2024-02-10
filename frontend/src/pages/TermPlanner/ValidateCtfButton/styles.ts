import { Modal as antdModal } from 'antd';
import styled from 'styled-components';

// NOTE: Very hacky way to override modal styling
// THIS is also just duplicate code of the
// EditMarksModal styling.
// A better programmer might refactor this
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
    &:hover {
      background-color: ${({ theme }) => theme.editMark.backgroundColorHover};
      border-color: ${({ theme }) => theme.purplePrimary};
    }
  }
`;

export default { Modal };
