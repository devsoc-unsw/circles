import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import openNotification from 'utils/openNotification';
import type { RootState } from 'config/store';
import { useAppSelector } from 'hooks';
import CS from '../common/styles';
import S from './styles';
import { useSelector } from 'react-redux';
import axios from 'axios';

const StartBrowsingStep = () => {
  const navigate = useNavigate();
  const { programCode, specs } = useAppSelector((state: RootState) => state.degree);
  const { token } = useSelector((state: RootState) => state.settings);

  const handleSaveUserSettings = async () => {
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
      try {
        await axios.post('user/reset', true, { params: { token } });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error resetting degree at handleDegreeChange: ' + err);
      }
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
