import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import openNotification from 'utils/openNotification';
import type { RootState } from 'config/store';
import { useAppDispatch, useAppSelector } from 'hooks';
import { setIsComplete } from 'reducers/degreeSlice';
import CS from '../common/styles';
import S from './styles';

const StartBrowsingStep = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { programCode, specs } = useAppSelector((state: RootState) => state.degree);

  const handleSaveUserSettings = () => {
    if (!programCode) {
      openNotification({
        type: 'error',
        message: 'Please select a degree'
      });
    } else if (!specs.length) {
      openNotification({
        type: 'error',
        message: 'Please select a specialisation'
      });
    } else {
      dispatch(setIsComplete(true));
      navigate('/course-selector');
    }
  };

  return (
    <CS.StepContentWrapper id="start browsing">
      <S.StartBrowsingWrapper>
        <Button type="primary" onClick={handleSaveUserSettings}>
          Start browsing courses!
        </Button>
      </S.StartBrowsingWrapper>
    </CS.StepContentWrapper>
  );
};

export default StartBrowsingStep;
