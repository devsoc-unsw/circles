/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { Typography } from 'antd';
import axios from 'axios';
import { SpecialisationTypes } from 'types/api';
import PageTemplate from 'components/PageTemplate';
import ResetModal from 'components/ResetModal';
import Steps from './common/steps';
import DegreeStep from './DegreeStep';
import SpecialisationStep from './SpecialisationStep';
import StartBrowsingStep from './StartBrowsingStep';
import S from './styles';
import YearStep from './YearStep';
import openNotification from 'utils/openNotification';
import { DegreeWizardPayload } from 'types/degreeWizard';

const { Title } = Typography;

const DegreeWizard = () => {
  const [specs, setSpecs] = useState(['majors', 'honours', 'minors']);
  const stepList = ['year', 'degree'].concat(specs).concat(['start browsing']);

  const [degreeInfo, setDegreeInfo] = useState({
    programCode: '',
    isComplete: false,
    startYear: undefined,
    endYear: undefined,
    specs: [],
  } as DegreeWizardPayload);

  const { programCode, isComplete } = degreeInfo;

  const navigate = useNavigate();

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
        console.log("trying to do use effect for getSteps");
        const res = await axios.get<SpecialisationTypes>(
          `/specialisations/getSpecialisationTypes/${programCode}`
        );
        console.log('res.data', res.data);
        setSpecs(res.data.types);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getSteps', e);
      }
    };
    console.log('programCode', programCode);
    if (programCode !== '') getSteps();
    // run when we actly adda progCode
  }, [programCode]);

  const [currStep, setCurrStep] = useState(Steps.YEAR);

  const incrementStep = (stepTo?: Steps) => {
    const step = stepTo ? stepList[stepTo] : stepList[currStep + 1];
    console.log('stepTo', stepTo);
    // if spec, then thats chillll
    if (stepTo === Steps.SPECS) {
      setCurrStep(stepTo);
    // no setep or its more than curr step
    // then we go forwards a state?????????????
    // not spec, or its null, kys?
    /// not defined HOWEVER
    } else if (!stepTo || stepTo > currStep) {
      console.log('stepTo (forward edition)', stepTo)
      setCurrStep((prevState) => prevState + 1);
    } else {
      console.log('stepTo, how tf is it this case', stepTo);
    }
    // we can increment a step IFFFF it moves forwards

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
        <ResetModal open={isComplete} onCancel={() => navigate('/course-selector')} />
        <Title className="text">Welcome to Circles!</Title>
        <S.Subtitle>
          Let’s start by setting up your UNSW degree, so you can make a plan that suits you.
        </S.Subtitle>
        <S.HorizontalLine />
        <S.StepsWrapper>
          <YearStep incrementStep={incrementStep} />
          {currStep >= Steps.DEGREE && <DegreeStep incrementStep={incrementStep} />}
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
          {currStep === stepList.length - 1 && <StartBrowsingStep />}
        </S.StepsWrapper>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};
export default DegreeWizard;
