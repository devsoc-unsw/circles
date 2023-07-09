import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { resetDegree } from 'utils/api/degreeApi';
import { getUser } from 'utils/api/userApi';
import openNotification from 'utils/openNotification';
import CS from '../common/styles';
import S from './styles';

const StartBrowsingStep = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userQuery = useQuery('user', getUser);
  // TODO: what if userQuery.data is undefined? (same as degreeWizard)
  const { programCode, specs } = userQuery.data?.degree || { programCode: '', specs: [] };

  const resetDegreeMutation = useMutation(resetDegree, {
    onSuccess: () => {
      queryClient.invalidateQueries('degree');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at resetDegreeMutation: ', err);
    }
  });

  const handleResetDegree = () => {
    resetDegreeMutation.mutate();
  };

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
      handleResetDegree();
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
