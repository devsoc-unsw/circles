import React, { useState } from "react";
import { Typography, Button, DatePicker } from "antd";
import { useDispatch } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "@react-spring/web";
import springProps from "../spring";
import { setDegreeLength, updateStartYear } from "../../../reducers/plannerSlice";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const YearStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const [nextStep, setNextStep] = useState(false);

  const handleYearChange = (_, [startYear, endYear]) => {
    setNextStep(startYear && endYear);
    const numYears = endYear - startYear + 1;
    dispatch(setDegreeLength(numYears));
    dispatch(updateStartYear(startYear));
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
