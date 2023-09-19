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

export default ValidateCtfButton;
