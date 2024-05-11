import React, { useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { Input, Menu, Typography } from 'antd';
import axios from 'axios';
import { fuzzy } from 'fast-fuzzy';
import { Programs } from 'types/api';
import { DegreeWizardPayload } from 'types/degreeWizard';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';

const { Title } = Typography;

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type Props = {
  incrementStep: (stepTo?: Steps) => void;
  degreeInfo: DegreeWizardPayload;
  setDegreeInfo: SetState<DegreeWizardPayload>;
};

const DegreeStep = ({ incrementStep, degreeInfo, setDegreeInfo }: Props) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [allDegrees, setAllDegrees] = useState<Record<string, string>>({});

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

  const onDegreeChange = async ({ key }: { key: string }) => {
    setInput(key);
    setDegreeInfo((prev) => ({
      ...prev,
      // key is of format `${programCode} - ${title}`; Need to extract code
      programCode: key.slice(0, 4)
    }));
    if (key) incrementStep(Steps.SPECS);
  };

  const searchDegree = (newInput: string) => {
    setInput(newInput);

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
            onSelect={onDegreeChange}
            selectedKeys={
              degreeInfo.programCode
                ? [`${degreeInfo.programCode} ${allDegrees[degreeInfo.programCode]}`]
                : []
            }
            items={degreeInfo.programCode ? [] : items}
            mode="inline"
            data-testid="antd-degree-menu"
          />
        )}
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default DegreeStep;
