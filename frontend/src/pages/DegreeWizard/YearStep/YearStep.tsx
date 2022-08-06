import React from "react";
import { useDispatch } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import { DatePicker, Typography } from "antd";
import { updateDegreeLength, updateStartYear } from "reducers/plannerSlice";
import springProps from "../common/spring";
import STEPS from "../common/steps";
import CS from "../common/styles";

const { Title } = Typography;
const { RangePicker } = DatePicker;

type Props = {
  incrementStep: (stepTo?: STEPS) => void
};

const YearStep = ({ incrementStep }: Props) => {
  const props = useSpring(springProps);
  const dispatch = useDispatch();

  const handleYearChange = (_, [startYear, endYear]: [string, string]) => {
    const numYears = parseInt(endYear, 10) - parseInt(startYear, 10) + 1;
    dispatch(updateDegreeLength(numYears));
    dispatch(updateStartYear(parseInt(startYear, 10)));

    if (startYear && endYear) incrementStep(STEPS.DEGREE);
  };

  return (
    <CS.StepContentWrapper id="year">
      <animated.div style={props}>
        <Title level={4} className="text">
          What years do you start and finish?
        </Title>
        <RangePicker
          picker="year"
          size="large"
          onChange={handleYearChange}
          style={{
            width: "100%",
          }}
        />
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default YearStep;
