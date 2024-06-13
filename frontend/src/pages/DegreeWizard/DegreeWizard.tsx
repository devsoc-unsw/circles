import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from 'antd';
import axios from 'axios';
import { SpecialisationTypes } from 'types/api';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { getUserIsSetup, resetUserDegree } from 'utils/api/userApi';
import openNotification from 'utils/openNotification';
import PageTemplate from 'components/PageTemplate';
import ResetModal from 'components/ResetModal';
import useToken from 'hooks/useToken';
import Steps from './common/steps';
import DegreeStep from './DegreeStep';
import SpecialisationStep from './SpecialisationStep';
import StartBrowsingStep from './StartBrowsingStep';
import S from './styles';
import YearStep from './YearStep';

const { Title } = Typography;

const DegreeWizard = () => {
  const [specs, setSpecs] = useState(['majors', 'honours', 'minors']);
  const stepList = ['year', 'degree'].concat(specs).concat(['start browsing']);
  const token = useToken();

  const [degreeInfo, setDegreeInfo] = useState<DegreeWizardPayload>({
    programCode: '',
    startYear: undefined,
    endYear: undefined,
    specs: []
  });

  const { programCode } = degreeInfo;
  const isSetup = useQuery({
    queryKey: ['degree', 'isSetup'], // TODO-OLLI(pm): fix this key
    queryFn: () => getUserIsSetup(token)
  }).data;
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const resetDegree = useMutation({
    mutationFn: () => resetUserDegree(token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['degree']
      });
      queryClient.invalidateQueries({
        queryKey: ['courses']
      });
      queryClient.invalidateQueries({
        queryKey: ['planner']
      });
      queryClient.clear();
    }
  });

  useEffect(() => {
    openNotification({
      type: 'info',
      message: 'Disclaimer',
      description:
        'Currently, Circles can only support some degrees and undergrad courses. If you find any errors, feel free to report a bug!'
    });
  }, []);

  useEffect(() => {
    const getSteps = async () => {
      try {
        const res = await axios.get<SpecialisationTypes>(
          `/specialisations/getSpecialisationTypes/${programCode}`
        );
        setSpecs(res.data.types);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getSteps', e);
      }
    };
    if (programCode !== '') getSteps();
    // run when we actually add d programCode
  }, [programCode]);

  const [currStep, setCurrStep] = useState(Steps.YEAR);

  const incrementStep = (stepTo?: Steps) => {
    const step = stepTo ? stepList[stepTo] : stepList[currStep + 1];
    // if spec, then that's chillll
    if (stepTo === Steps.SPECS) {
      setCurrStep(stepTo);
      // no step or its more than curr step
      // then we go forwards a state?????????????
      // not spec, or its null, :(
      // not defined HOWEVER (this may falsely trigger when stepTo is 0)
    } else if (!stepTo || stepTo > currStep) {
      setCurrStep((prevState) => prevState + 1);
    }
    // we can increment a step IF it moves forwards

    setTimeout(() => {
      scroller.scrollTo(step, {
        duration: 1500,
        smooth: true
      });
    }, 100);
  };

  return (
    <PageTemplate showHeader={false}>
      <S.ContainerWrapper>
        <ResetModal
          open={isSetup}
          onCancel={() => navigate('/course-selector')}
          onOk={() => resetDegree.mutate()}
        />
        <Title className="text">Welcome to Circles!</Title>
        <S.Subtitle>
          Let’s start by setting up your UNSW degree, so you can make a plan that suits you.
        </S.Subtitle>
        <S.HorizontalLine />
        <S.StepsWrapper>
          <YearStep incrementStep={incrementStep} setDegreeInfo={setDegreeInfo} />
          {currStep >= Steps.DEGREE && (
            <DegreeStep
              incrementStep={incrementStep}
              degreeInfo={degreeInfo}
              setDegreeInfo={setDegreeInfo}
            />
          )}
          {specs.map(
            (stepName, index) =>
              currStep - Steps.SPECS >= index && (
                <SpecialisationStep
                  incrementStep={incrementStep}
                  currStep={currStep - Steps.SPECS === index}
                  type={stepName}
                  degreeInfo={degreeInfo}
                  setDegreeInfo={setDegreeInfo}
                />
              )
          )}
          {currStep >= Steps.DONE && <StartBrowsingStep degreeInfo={degreeInfo} />}
        </S.StepsWrapper>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};
export default DegreeWizard;
