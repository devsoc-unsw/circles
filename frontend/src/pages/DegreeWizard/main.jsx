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
import { DatePicker } from "antd";
import "./main.less";

const { RangePicker } = DatePicker;
function DegreeWizard() {
  const theme = useSelector((store) => store.theme);
  const dispatch = useDispatch();

  React.useEffect(() => {
    // TODO: Warning dialog before planner is reset.

    // Degree selector needs to reset to prevent identical courses in a term
    dispatch(plannerActions("RESET_PLANNER"));
  }, []);

  const [isYearsSet, setIsYearsSet] = React.useState(false);

  const handleYearChange = (_, [startYear, endYear]) => {
    const numYears = endYear - startYear + 1;
    dispatch(plannerActions("SET_DEGREE_LENGTH", numYears));
    dispatch(plannerActions("UPDATE_START_YEAR", startYear));
    setIsYearsSet(true);
  };
  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  return (
    <div className="degree-root-container">
      <div className={"step-duration"}>
        <RangePicker picker="year" size="large" onChange={handleYearChange} />
      </div>
      <animated.div style={props}>
        <div className="step-container">
          <div className="step-content" id={"Degree"}>
            <DegreeStep isYearsSet={isYearsSet} />
          </div>
          <div className="step-content" id={"Specialisation"}>
            <SpecialisationStep />
          </div>
          <div className="step-content" id={"Minor"}>
            <MinorStep />
          </div>
          <div className="step-content" id={"Previous Courses"}>
            <PreviousCoursesStep />
          </div>
        </div>
      </animated.div>
      {theme === "dark" && <ParticleBackground />}
    </div>
  );
}
export default DegreeWizard;
