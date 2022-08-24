import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scroller } from 'react-scroll';
import { Typography } from 'antd';
import axios from 'axios';
import { SpecialisationTypes } from 'types/api';
import openNotification from 'utils/openNotification';
import PageTemplate from 'components/PageTemplate';
import type { RootState } from 'config/store';
import { resetCourses } from 'reducers/coursesSlice';
import { resetTabs } from 'reducers/courseTabsSlice';
import { resetDegree } from 'reducers/degreeSlice';
import { resetPlanner } from 'reducers/plannerSlice';
import Steps from './common/steps';
import DegreeStep from './DegreeStep';
import ResetModal from './ResetModal';
import SpecialisationStep from './SpecialisationStep';
import StartBrowsingStep from './StartBrowsingStep';
import S from './styles';
import YearStep from './YearStep';

const { Title } = Typography;

const DegreeWizard = () => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [specs, setSpecs] = useState(['majors', 'honours', 'minors']);
  const stepList = ['year', 'degree'].concat(specs).concat(['start browsing']);
  const degree = useSelector((state: RootState) => state.degree);

  useEffect(() => {
    if (degree.isComplete) {
      setModalVisible(true);
    } else {
      dispatch(resetPlanner());
      dispatch(resetDegree());
      dispatch(resetTabs());
      dispatch(resetCourses());
    }
    openNotification({
      type: 'info',
      message: 'Disclaimer',
      description: 'Currently, Circles can only support some degrees and undergrad courses. If you find any errors, feel free to report a bug!',
    });
  }, [degree.isComplete, dispatch]);

  useEffect(() => {
    const getSteps = async () => {
      try {
        const res = await axios.get<SpecialisationTypes>(`/specialisations/getSpecialisationTypes/${degree.programCode}`);
        setSpecs(res.data.types);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getSteps', e);
      }
    };
    if (degree.programCode !== '') getSteps();
  }, [degree.programCode]);

  const [currStep, setCurrStep] = useState(Steps.YEAR);

  const incrementStep = (stepTo?: Steps) => {
    const step = stepTo ? stepList[stepTo] : stepList[currStep + 1];
    if (!stepTo || stepTo > currStep) setCurrStep((prevState) => prevState + 1);
    setTimeout(() => {
      scroller.scrollTo(step, {
        duration: 1500,
        smooth: true,
      });
    }, 100);
  };

  return (
    <PageTemplate showHeader={false}>
      <S.ContainerWrapper>
        <ResetModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
        <Title className="text">Welcome to Circles!</Title>
        <S.Subtitle>
          Let’s start by setting up your UNSW degree, so you can make a plan that
          suits you.
        </S.Subtitle>
        <S.HorizontalLine />
        <S.StepsWrapper>
          <YearStep incrementStep={incrementStep} />
          {currStep >= Steps.DEGREE && <DegreeStep incrementStep={incrementStep} />}
          {specs.map((stepName, index) => (
            currStep - Steps.SPECS >= index && (
            <SpecialisationStep
              incrementStep={incrementStep}
              currStep={currStep - Steps.SPECS === index}
              type={stepName}
            />
            )
          ))}
          {currStep === stepList.length - 1 && <StartBrowsingStep />}
        </S.StepsWrapper>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};
export default DegreeWizard;
