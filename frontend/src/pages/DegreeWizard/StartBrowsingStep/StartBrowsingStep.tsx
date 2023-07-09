import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { setupDegreeWizard } from 'utils/api/degreeApi';
import openNotification from 'utils/openNotification';
import CS from '../common/styles';
import S from './styles';

type Props = {
  degreeInfo: DegreeWizardPayload;
};

const StartBrowsingStep = ({ degreeInfo }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setupDegreeMutation = useMutation(setupDegreeWizard, {
    onSuccess: () => {
      queryClient.invalidateQueries('degree');
      queryClient.invalidateQueries('planner');
      queryClient.invalidateQueries('courses');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at resetDegreeMutation: ', err);
    }
  });

  const handleSetupDegree = () => {
    setupDegreeMutation.mutate(degreeInfo);
  };

  const handleSaveUserSettings = async () => {
    // TODO: Are these checks necessary?
    if (!degreeInfo.programCode) {
      openNotification({
        type: 'error',
        message: 'Please select a degree'
      });
    } else if (!degreeInfo.specs.length) {
      openNotification({
        type: 'error',
        message: 'Please select a specialisation'
      });
    } else {
      handleSetupDegree();
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
