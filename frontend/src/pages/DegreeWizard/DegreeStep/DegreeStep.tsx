import React, { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import { Select, Typography } from 'antd';
import { fuzzy } from 'fast-fuzzy';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { fetchAllDegrees } from 'utils/api/programsApi';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type Props = {
  incrementStep: (stepTo?: Steps) => void;
  setDegreeInfo: SetState<DegreeWizardPayload>;
};

const DegreeStep = ({ incrementStep, setDegreeInfo }: Props) => {
  const allDegreesQuery = useQuery({
    queryKey: ['programs'],
    queryFn: fetchAllDegrees,
    select: (data) => data.programs
  });
  const allDegrees = allDegreesQuery.data ?? {};

  const onDegreeChange = async (key: string) => {
    setDegreeInfo((prev) => ({
      ...prev,
      // key is of format `${programCode} - ${title}`; Need to extract code
      programCode: key.slice(0, 4)
    }));
    if (key) incrementStep(Steps.SPECS);
  };

  const props = useSpring(springProps);

  const [options, setOptions] = useState<string[]>([]);

  const searchDegree = (newInput: string) => {
    const fuzzedDegrees = Object.keys(allDegrees)
      .map((code) => `${code} ${allDegrees[code]}`)
      .map((title) => {
        return {
          distance: fuzzy(newInput, title),
          name: title
        };
      });

    fuzzedDegrees.sort((a, b) => a.name.length - b.name.length);
    fuzzedDegrees.sort((a, b) => b.distance - a.distance);

    setOptions(fuzzedDegrees.splice(0, 8).map((pair) => pair.name));
  };

  const items = options.map((degreeName) => ({
    label: degreeName,
    value: degreeName
  }));

  return (
    <CS.StepContentWrapper id="degree">
      <animated.div style={props}>
        <Title level={4} className="text">
          What are you studying?
        </Title>
        <Select
          size="large"
          showSearch
          optionFilterProp="label"
          placeholder="Search Degree"
          style={{ width: '100%' }}
          onSelect={onDegreeChange}
          options={items}
          filterOption={false}
          onSearch={searchDegree}
        />
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default DegreeStep;
