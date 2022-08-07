import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import {
  Input, Menu, Typography,
} from 'antd';
import axios from 'axios';
import { Programs } from 'types/api';
import type { RootState } from 'config/store';
import { resetDegree, setProgram } from 'reducers/degreeSlice';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;

type Props = {
  incrementStep: (stepTo?: Steps) => void
};

const DegreeStep = ({ incrementStep }: Props) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [allDegrees, setAllDegrees] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const programCode = useSelector((store: RootState) => store.degree.programCode);

  const fetchAllDegrees = async () => {
    const res = await axios.get<Programs>('/programs/getPrograms');
    setAllDegrees(res.data.programs);
  };

  useEffect(() => {
    fetchAllDegrees();
  }, []);

  const handleDegreeChange = ({ key }: { key: string }) => {
    dispatch(resetDegree());
    dispatch(
      setProgram({ programCode: key.substring(0, 4), programName: key.substring(5) }),
    );
    setInput(key);
    setOptions([]);

    if (key) incrementStep(Steps.SPECS);
  };

  const searchDegree = (newInput: string) => {
    setInput(newInput);
    const degreeOptions = Object.keys(allDegrees).map((code) => `${code} ${allDegrees[code]}`)
      .filter((degree) => degree.toLowerCase().includes(newInput.toLowerCase()))
      .splice(0, 8);
    setOptions(degreeOptions);
  };

  const props = useSpring(springProps);

  const items = options.map((degreeName) => ({
    label: degreeName,
    key: degreeName,
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
          onChange={(e) => (searchDegree(e.target.value))}
        />
        {input && options && (
          <Menu
            onClick={handleDegreeChange}
            selectedKeys={programCode ? [programCode] : []}
            items={items}
            mode="inline"
          />
        )}
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default DegreeStep;
