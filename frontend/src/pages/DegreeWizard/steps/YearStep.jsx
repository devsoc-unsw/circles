import React, { useState } from "react";
import { Typography, Button, DatePicker } from "antd";
import { useDispatch } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "@react-spring/web";
import plannerActions from "../../../actions/plannerActions";
import springProps from "../spring";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const YearStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const [nextStep, setNextStep] = useState(false);

  const handleYearChange = (_, [startYear, endYear]) => {
    setNextStep(startYear && endYear);
    const numYears = endYear - startYear + 1;
    dispatch(plannerActions("SET_DEGREE_LENGTH", numYears));
    dispatch(plannerActions("UPDATE_START_YEAR", startYear));
  };
  const props = useSpring(springProps);
  return (
    <animated.div style={props} className="step-duration">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What years do you start and finish?
        </Title>
        {nextStep && currStep === 1 && (
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
  );
};

export default YearStep;
