import React from "react";
import ParticleBackground from "./ParticleBackground";
import { useSelector } from "react-redux";
import { DegreeStep } from "./steps/DegreeStep";
import { SpecialisationStep } from "./steps/SpecialisationStep";
import { PreviousCoursesStep } from "./steps/PreviousCoursesStep";
import { MinorStep } from "./steps/MinorStep";
import { plannerActions } from "../../actions/plannerActions";
import { useDispatch } from "react-redux";
import { useSpring, animated } from "react-spring";
import { DatePicker, Button, Typography } from "antd";
import "./main.less";
import { springProps } from "./spring";
import { scroller } from "react-scroll";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function DegreeWizard() {
  const theme = useSelector((store) => store.theme);
  const dispatch = useDispatch();

  React.useEffect(() => {
    // TODO: Warning dialog before planner is reset.

    // Degree selector needs to reset to prevent identical courses in a term
    dispatch(plannerActions("RESET_PLANNER"));
  }, []);

  const handleYearChange = (_, [startYear, endYear]) => {
    const numYears = endYear - startYear + 1;
    dispatch(plannerActions("SET_DEGREE_LENGTH", numYears));
    dispatch(plannerActions("UPDATE_START_YEAR", startYear));
  };

  const props = useSpring(springProps);

  const [currStep, setCurrStep] = React.useState(1);
  const incrementStep = () => {
    setCurrStep(currStep + 1);
    let nextId = "Degree";
    if (currStep === 1) nextId = "Degree";
    if (currStep === 2) nextId = "Specialisation";
    if (currStep === 3) nextId = "Minor";
    if (currStep === 4) nextId = "Previous Courses";
    setTimeout(() => {
      scroller.scrollTo(nextId, {
        duration: 1500,
        smooth: true,
      });
    }, 100);
  };

  return (
    <div className="degree-root-container">
      <Title>Welcome to Circles!</Title>
      <h3 className=" subtitle">
        Let’s start by setting up your UNSW degree, so you can make a plan that
        suits you.
      </h3>
      <hr className="rule" />

      <div className="steps-container">
        {currStep >= 1 && (
          // TODO: Move the duration step into its own component
          <animated.div style={props} className="step-duration">
            <div className="steps-heading-container">
              <Title level={4} className="text">
                What years do you start and finish?
              </Title>
              {currStep === 1 && (
                <Button type="primary" onClick={incrementStep}>
                  Next
                </Button>
              )}
            </div>
            <RangePicker
              picker="year"
              size="large"
              onChange={handleYearChange}
            />
          </animated.div>
        )}
        {currStep >= 2 && (
          <div className="step-content" id="Degree">
            <DegreeStep incrementStep={incrementStep} currStep={currStep} />
          </div>
        )}
        {currStep >= 3 && (
          <div className="step-content" id="Specialisation">
            <SpecialisationStep
              incrementStep={incrementStep}
              currStep={currStep}
            />
          </div>
        )}
        {currStep >= 4 && (
          <div className="step-content" id={"Minor"}>
            <MinorStep incrementStep={incrementStep} currStep={currStep} />
          </div>
        )}
        {currStep >= 5 && (
          <div className="step-content" id={"Previous Courses"}>
            <PreviousCoursesStep />
          </div>
        )}
      </div>
      {theme === "dark" && <ParticleBackground />}
    </div>
  );
}
export default DegreeWizard;
