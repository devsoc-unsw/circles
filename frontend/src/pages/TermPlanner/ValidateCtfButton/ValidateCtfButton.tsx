/* eslint-disable */
import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import prepareCoursesForValidationPayload from 'utils/prepareCoursesForValidationPayload';
import { RootState } from 'config/store';
import CS from '../common/styles';
import S from './styles';

const ValidateCtfButton = () => {
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);
  const [open, setOpen] = React.useState(false);

  const validateCtf = () => {
    // TODO: Call this async and disaplay output
    setOpen(true);
    axios.post('/ctf/validateCtf/', prepareCoursesForValidationPayload(planner, degree, false));
  };

  return (<>
    <CS.Button onClick={validateCtf}>Validate CTF</CS.Button>
    <S.Modal
      title="Validate CTF"
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      width="400px"
    />
  </>);
};

export default ValidateCtfButton;
