import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import { Typography } from 'antd';
import axios from 'axios';
import openNotification from 'utils/openNotification';
import Spinner from 'components/Spinner';
import { RootState } from 'config/store';
import { useAppDispatch } from 'hooks';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;
const RangePicker = React.lazy(() =>
  import('components/Datepicker').then((d) => ({ default: d.default.RangePicker }))
);

type Props = {
  incrementStep: (stepTo?: Steps) => void;
};

const YearStep = ({ incrementStep }: Props) => {
  const props = useSpring(springProps);
  const dispatch = useAppDispatch();
  const { token } = useSelector((state: RootState) => state.settings);

  return (
    <CS.StepContentWrapper id="year">
      <animated.div style={props}>
        <Title level={4} className="text">
          What years do you start and finish?
        </Title>
        <Suspense fallback={<Spinner text="Loading Year Selector..." />}>
          <RangePicker
            data-testid="antd-rangepicker"
            picker="year"
            size="large"
            style={{
              width: '100%'
            }}
            onChange={async (_, [startYear, endYear]: [string, string]) => {
              const startYearInt = parseInt(startYear, 10);
              const numYears = parseInt(endYear, 10) - startYearInt + 1;
              // We can trust num years to be a valid number because the range picker only allows valid ranges
              try {
                await axios.put('/user/updateDegreeLength', { numYears }, { params: { token } });
                await axios.put(
                  '/user/updateStartYear',
                  { startYear: startYearInt },
                  { params: { token } }
                );
              } catch {
                openNotification({
                  type: 'error',
                  message: 'Error setting degree start year or length',
                  description: 'There was an error updating the degree start year or length.'
                });
                return;
              }

              if (startYear && endYear) incrementStep(Steps.DEGREE);
            }}
          />
        </Suspense>
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default YearStep;
