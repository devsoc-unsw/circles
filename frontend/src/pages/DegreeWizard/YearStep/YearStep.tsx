import React, { Suspense } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { Typography } from 'antd';
import { DegreeWizardPayload } from 'types/degreeWizard';
import Spinner from 'components/Spinner';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;
const YearPicker = React.lazy(() =>
  import('antd').then((d) => ({ default: d.DatePicker.RangePicker }))
);

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type Props = {
  incrementStep: (stepTo?: Steps) => void;
  setDegreeInfo: SetState<DegreeWizardPayload>;
};

const YearStep = ({ incrementStep, setDegreeInfo }: Props) => {
  const props = useSpring(springProps);

  const handleOnChange = async (_: unknown, [startYear, endYear]: string | string[]) => {
    // We can trust num years to be a valid number because the range picker only allows valid ranges
    setDegreeInfo((prev) => ({
      ...prev,
      startYear: parseInt(startYear, 10),
      endYear: parseInt(endYear, 10)
    }));

    if (startYear && endYear) incrementStep(Steps.DEGREE);
  };

  return (
    <CS.StepContentWrapper id="year">
      <animated.div style={props}>
        <Title level={4} className="text">
          What years do you start and finish?
        </Title>
        <Suspense fallback={<Spinner text="Loading Year Selector..." />}>
          <YearPicker
            picker="year"
            data-testid="antd-rangepicker"
            size="large"
            style={{
              width: '100%'
            }}
            onChange={handleOnChange}
          />
        </Suspense>
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default YearStep;
