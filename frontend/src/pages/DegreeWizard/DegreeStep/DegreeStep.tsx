import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { animated, useSpring } from '@react-spring/web';
import { Input, Menu, Typography } from 'antd';
import axios from 'axios';
import { Programs } from 'types/api';
import type { RootState } from 'config/store';
import { useAppSelector } from 'hooks';
import { handleDegreeChange } from 'utils/api/degreeApi';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;

type Props = {
  incrementStep: (stepTo?: Steps) => void;
};

const DegreeStep = ({ incrementStep }: Props) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [allDegrees, setAllDegrees] = useState<Record<string, string>>({});

  const programCode = useAppSelector((store: RootState) => store.degree.programCode);

  const fetchAllDegrees = async () => {
    try {
      const res = await axios.get<Programs>('/programs/getPrograms');
      setAllDegrees(res.data.programs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at fetchAllDegrees', e);
    }
  };

  useEffect(() => {
    fetchAllDegrees();
  }, []);

  const degreeChangeMutation = useMutation(handleDegreeChange, {
    onMutate: ({ programCode }) => {
      setInput(programCode);
      setOptions([]);
      if (programCode) incrementStep(Steps.SPECS);
    }
  });

  const onDegreeChange = async ({ key }: { key: string }) => {
    degreeChangeMutation.mutate({ programCode: key });
  };

  const searchDegree = (newInput: string) => {
    setInput(newInput);
    const degreeOptions = Object.keys(allDegrees)
      .map((code) => `${code} ${allDegrees[code]}`)
      .filter((degree) => degree.toLowerCase().includes(newInput.toLowerCase()))
      .splice(0, 8);
    setOptions(degreeOptions);
  };

  const props = useSpring(springProps);

  const items = options.map((degreeName) => ({
    label: degreeName,
    key: degreeName
  }));

  return (
    <CS.StepContentWrapper id="degree">
      <animated.div style={props}>
        <Title level={4} className="text">
          What are you studying?
        </Title>
        <Input
          size="large"
          type="text"
          value={input}
          placeholder="Search Degree"
          onChange={(e) => searchDegree(e.target.value)}
        />
        {input && options && (
          <Menu
            onClick={onDegreeChange}
            selectedKeys={programCode ? [programCode] : []}
            items={items}
            mode="inline"
            data-testid="antd-degree-menu"
          />
        )}
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default DegreeStep;
