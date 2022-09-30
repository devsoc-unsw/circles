import React, { Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import { Typography } from 'antd';
import Spinner from 'components/Spinner';
import { updateDegreeLength, updateStartYear } from 'reducers/plannerSlice';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;
const RangePicker = React.lazy(() => import('../../../components/Datepicker').then((d) => ({ default: d.default.RangePicker })));

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
        <Suspense fallback={<Spinner text="Loading Year Selector..." />}>
          <RangePicker
            data-testid="ant-rangepicker"
            picker="year"
            size="large"
            style={{
              width: '100%',
            }}
            onChange={(_, [startYear, endYear]: [string, string]) => {
              const numYears = parseInt(endYear, 10) - parseInt(startYear, 10) + 1;
              dispatch(updateDegreeLength(numYears));
              dispatch(updateStartYear(parseInt(startYear, 10)));

              if (startYear && endYear) incrementStep(Steps.DEGREE);
            }}
          />
        </Suspense>
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default YearStep;
