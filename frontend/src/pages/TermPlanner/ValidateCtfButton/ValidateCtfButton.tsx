/* eslint-disable */
import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import prepareCoursesForValidationPayload from 'utils/prepareCoursesForValidationPayload';
import { RootState } from 'config/store';
import CS from '../common/styles';
import S from './styles';

type CtfResult = {
  valid: boolean,
  failed: number,
  message: string,
}

const loadingResult: CtfResult = {
  valid: false,
  failed: 0,
  message: 'Loading...',
};

const ValidateCtfButton = () => {
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState(loadingResult);

  const validateCtf = async () => {
    // TODO: Call this async and disaplay output
    setOpen(true);
    const res = await axios.post<CtfResult>('/ctf/validateCtf/', prepareCoursesForValidationPayload(planner, degree, false));
    setResult(res.data);
    console.log(res.data);
  };

  return (<>
    <CS.Button onClick={validateCtf}>Validate CTF</CS.Button>
    <S.Modal
      title="Validate CTF"
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      width="400px"
    >
      valid: {result.valid ? 'true' : 'false'}<br />
      failed: {result.failed}<br />
      message: {result.message}<br />
    </S.Modal>
  </>);
};

export default ValidateCtfButton;
