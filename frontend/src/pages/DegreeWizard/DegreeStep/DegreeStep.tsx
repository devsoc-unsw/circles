import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import { Input, Menu, Typography } from 'antd';
import axios from 'axios';
import { Programs } from 'types/api';
import type { RootState } from 'config/store';
import { useAppSelector } from 'hooks';
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
  const { token } = useSelector((state: RootState) => state.settings);

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

  const handleDegreeChange = async ({ key }: { key: string }) => {
    const data = { programCode: key.substring(0, 4) };
    try {
      await axios.post('user/reset', {}, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error resetting degree at handleDegreeChange: ' + err);
    }
    try {
      await axios.post('user/setProgram', data, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error settingProgram at handleDegreeChange: ' + err);
    }
    setInput(key);
    setOptions([]);

    if (key) incrementStep(Steps.SPECS);
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
            onClick={handleDegreeChange}
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
