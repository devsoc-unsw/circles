import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'antd';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { setupDegreeWizard } from 'utils/api/degreeApi';
import useNotification from 'hooks/useNotification';
import useToken from 'hooks/useToken';
import CS from '../common/styles';
import S from './styles';

type Props = {
  degreeInfo: DegreeWizardPayload;
};

const StartBrowsingStep = ({ degreeInfo }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useToken();

  const setupDegreeMutation = useMutation({
    mutationFn: (wizard: DegreeWizardPayload) => setupDegreeWizard(token, wizard),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['degree']
      });
      queryClient.invalidateQueries({
        queryKey: ['planner']
      });
      queryClient.invalidateQueries({
        queryKey: ['courses']
      });
      queryClient.clear();
      navigate('/course-selector');
    },
    onError: (err) => {
      // TODO: Give the user a notification for stuff like this
      // eslint-disable-next-line no-console
      console.error('Error at resetDegreeMutation: ', err);
    }
  });

  const handleSetupDegree = () => {
    setupDegreeMutation.mutate(degreeInfo);
  };

  const selectDegreeNotification = useNotification({
    name: 'select-degree-error-notification',
    type: 'error',
    message: 'Please select a degree'
  });

  const selectSpecNotification = useNotification({
    name: 'select-specialisation-error-notification',
    type: 'error',
    message: 'Please select a specialisation'
  });

  const handleSaveUserSettings = async () => {
    // TODO: Are these checks necessary?
    if (!degreeInfo.programCode) {
      selectDegreeNotification.tryOpenNotification();
    } else if (!degreeInfo.specs.length) {
      selectSpecNotification.tryOpenNotification();
    } else {
      handleSetupDegree();
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
