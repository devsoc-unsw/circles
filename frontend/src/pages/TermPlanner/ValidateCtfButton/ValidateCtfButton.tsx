import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import prepareCoursesForValidationPayload from 'utils/prepareCoursesForValidationPayload';
import { RootState } from 'config/store';
import CS from '../common/styles';

const ValidateCtfButton = () => {
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);

  const validateCtf = () => {
    // TODO: Call this async and disaplay output
    axios.post('/ctf/validateCtf/', prepareCoursesForValidationPayload(planner, degree, false));
  };

  return <CS.Button onClick={validateCtf}>Validate CTF</CS.Button>;
};

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

export default { EditMarkWrapper, LetterGradeWrapper, Input, Modal };
