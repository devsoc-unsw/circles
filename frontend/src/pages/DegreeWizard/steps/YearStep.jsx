import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import { DatePicker, Typography } from "antd";
import { updateDegreeLength, updateStartYear } from "reducers/plannerSlice";
import springProps from "./spring";
import "./steps.less";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const YearStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const [nextStep, setNextStep] = useState(false);

  const handleYearChange = (_, [startYear, endYear]) => {
    setNextStep(startYear && endYear);
    const numYears = endYear - startYear + 1;
    dispatch(updateDegreeLength(numYears));
    dispatch(updateStartYear(startYear));
  };
  const props = useSpring(springProps);
  return (
    <animated.div style={props} className="step-duration">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What years do you start and finish?
        </Title>
        {nextStep && currStep === 1 && dispatch(incrementStep)}
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
