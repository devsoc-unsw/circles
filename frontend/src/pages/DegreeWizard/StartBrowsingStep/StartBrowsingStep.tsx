import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { resetDegree } from 'utils/api/degreeApi';
import openNotification from 'utils/openNotification';
import type { RootState } from 'config/store';
import { useAppSelector } from 'hooks';
import CS from '../common/styles';
import S from './styles';

const StartBrowsingStep = () => {
  const navigate = useNavigate();
  const { programCode, specs } = useAppSelector((state: RootState) => state.degree);

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
      const degreeQuery = useQuery('degree', resetDegree);
      if (degreeQuery.isError) {
        console.log('Error while resetting degree');
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
