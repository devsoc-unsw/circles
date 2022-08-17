import React from 'react';
import { useDispatch } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import { Typography } from 'antd';
import DatePicker from 'components/Datepicker';
import { updateDegreeLength, updateStartYear } from 'reducers/plannerSlice';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type Props = {
  incrementStep: (stepTo?: Steps) => void
};

const YearStep = ({ incrementStep }: Props) => {
  const props = useSpring(springProps);
  const dispatch = useDispatch();

  return (
    <CS.StepContentWrapper id="year">
      <animated.div style={props}>
        <Title level={4} className="text">
          What years do you start and finish?
        </Title>
        <RangePicker
          picker="year"
          size="large"
          style={{
            width: '100%',
          }}
          onChange={(_, [startYear, endYear]) => {
            const numYears = parseInt(endYear, 10) - parseInt(startYear, 10) + 1;
            dispatch(updateDegreeLength(numYears));
            dispatch(updateStartYear(parseInt(startYear, 10)));

            if (startYear && endYear) incrementStep(Steps.DEGREE);
          }}
        />
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default YearStep;
