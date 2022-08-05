import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scroller } from "react-scroll";
import {
  notification, Typography,
} from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import { RootState } from "config/store";
import { resetCourses } from "reducers/coursesSlice";
import { resetTabs } from "reducers/courseTabsSlice";
import { resetDegree } from "reducers/degreeSlice";
import { resetPlanner } from "reducers/plannerSlice";
import STEPS from "./common/steps";
import DegreeStep from "./DegreeStep";
import ResetModal from "./ResetModal";
import SpecialisationStep from "./SpecialisationStep";
import StartBrowsingStep from "./StartBrowsingStep";
import S from "./styles";
import YearStep from "./YearStep";

const { Title } = Typography;

const DegreeWizard = () => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [specs, setSpecs] = useState(["majors", "honours", "minors"]);
  const stepList = ["year", "degree"].concat(specs).concat(["start browsing"]);
  const degree = useSelector((state: RootState) => state.degree);

  const csDegreeDisclaimer = () => {
    notification.info({
      message: "Disclaimer",
      description: "Currently, Circles can only support some degrees and undergrad courses. If you find any errors, feel free to report a bug!",
      placement: "bottomRight",
      duration: 4,
    });
  };

  useEffect(() => {
    if (degree.isComplete) {
      setModalVisible(true);
    } else {
      dispatch(resetPlanner());
      dispatch(resetDegree());
      dispatch(resetTabs());
      dispatch(resetCourses());
    }
    csDegreeDisclaimer();
  }, []);

  useEffect(() => {
    const getSteps = async () => {
      const res = await axios.get(`/specialisations/getSpecialisationTypes/${degree.programCode}`);
      setSpecs(res.data.types);
    };
    if (degree.programCode !== "") getSteps();
  }, [degree.programCode]);

  const [currStep, setCurrStep] = useState(STEPS.YEAR);

  const incrementStep = (stepTo?: STEPS) => {
    const step = stepTo ? stepList[stepTo] : stepList[currStep + 1];
    if (stepTo > currStep || !stepTo) setCurrStep((prevState) => prevState + 1);
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
          {currStep >= STEPS.DEGREE && <DegreeStep incrementStep={incrementStep} />}
          {specs.map((stepName, index) => (
            currStep - STEPS.SPECS >= index && (
            <SpecialisationStep
              incrementStep={incrementStep}
              currStep={currStep - STEPS.SPECS === index}
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
