import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Radio } from 'antd';
import { CoreCoursesPreference, DegreeWizardPayload } from 'types/degreeWizard';
import { useSetupDegreeWizardMutation } from 'utils/apiHooks/user';
import openNotification from 'utils/openNotification';
import CS from '../common/styles';
import S from './styles';

type Props = {
  degreeInfo: DegreeWizardPayload;
};

const CORE_COURSES_OPTIONS: { label: string; value: CoreCoursesPreference }[] = [
  { label: "Don't add core courses", value: 'none' },
  { label: 'Add lower-level courses', value: 'lower' },
  { label: 'Add higher-level courses', value: 'higher' }
];

const StartBrowsingStep = ({ degreeInfo }: Props) => {
  const navigate = useNavigate();
  const [addCoreCourses, setAddCoreCourses] = useState<CoreCoursesPreference>('lower');

  const setupDegreeMutation = useSetupDegreeWizardMutation({
    mutationOptions: { onSuccess: () => navigate('/course-selector') }
  });

  const handleSetupDegree = () => {
    setupDegreeMutation.mutate({ ...degreeInfo, addCoreCourses });
  };

  const handleSaveUserSettings = async () => {
    // TODO: Rewrite these checks in the backend
    // The check below is not always required, i.e. 3362
    // If we do this at the backend, we can check everything, and only when needed
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
    }
  };

  return (
    <CS.StepContentWrapper id="start browsing">
      <S.StartBrowsingWrapper>
        <Radio.Group
          options={CORE_COURSES_OPTIONS}
          onChange={(e) => setAddCoreCourses(e.target.value as CoreCoursesPreference)}
          value={addCoreCourses}
        />
        <Button type="primary" onClick={handleSaveUserSettings}>
          Start browsing courses!
        </Button>
      </S.StartBrowsingWrapper>
    </CS.StepContentWrapper>
  );
};

export default StartBrowsingStep;
