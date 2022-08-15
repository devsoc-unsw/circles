import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import Button from 'antd/lib/button';
import Menu from 'antd/lib/menu';
import Typography from 'antd/lib/typography';
import axios from 'axios';
import { Specialisations } from 'types/api';
import type { RootState } from 'config/store';
import { addSpecialisation, removeSpecialisation } from 'reducers/degreeSlice';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';
import S from './styles';

const { Title } = Typography;

type Props = {
  incrementStep: (stepTo?: Steps) => void
  currStep: boolean
  type: string
};

type Specialisation = {
  [spec: string]: {
    specs: Record<string, string>
    notes: string
  }
};

const SpecialisationStep = ({ incrementStep, currStep, type }: Props) => {
  const props = useSpring(springProps);
  const dispatch = useDispatch();
  const { programCode, specs } = useSelector((store: RootState) => store.degree);
  const [options, setOptions] = useState<Specialisation>({ someProgramName: { specs: { major: 'major data' }, notes: 'a note' } });

  const fetchAllSpecialisations = useCallback(async () => {
    try {
      const res = await axios.get<Specialisations>(`/specialisations/getSpecialisations/${programCode}/${type}`);
      setOptions(res.data.spec as Specialisation);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at getSteps', e);
    }
  }, [programCode, type]);

  useEffect(() => {
    if (programCode !== '') fetchAllSpecialisations();
  }, [fetchAllSpecialisations, programCode, type]);

  return (
    <CS.StepContentWrapper id={type}>
      <animated.div style={props}>
        <CS.StepHeadingWrapper>
          <Title level={4} className="text">
            What are your {type}?
          </Title>
          {currStep && (
          <Button type="primary" onClick={() => incrementStep()}>
            Next
          </Button>
          )}
        </CS.StepHeadingWrapper>
        <S.Menu
          onSelect={(e: { key: string; }) => dispatch(addSpecialisation(e.key))}
          onDeselect={(e : { key: string; }) => dispatch(removeSpecialisation(e.key))}
          selectedKeys={specs}
          defaultOpenKeys={['0']}
          mode="inline"
          style={{
            gap: '10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {Object.keys(options).map((sub) => (
            <Menu.SubMenu
              key={sub}
              title={`${type.replace(/^\w/, (c) => c.toUpperCase())} for ${sub}`}
              style={{
                border: '1px solid #a86fed',
              }}
            >
              {(options[sub].notes)
                ? (
                  <Menu.ItemGroup title={`Note: ${options[sub].notes}`}>
                    {Object.keys(options[sub].specs).sort().map((key) => (
                      <Menu.Item key={key}>
                        {key} {options[sub].specs[key]}
                      </Menu.Item>
                    ))}
                  </Menu.ItemGroup>
                )
                : Object.keys(options[sub].specs).map((key) => (
                  <Menu.Item key={key}>
                    {key} {options[sub].specs[key]}
                  </Menu.Item>
                ))}
            </Menu.SubMenu>
          ))}
        </S.Menu>
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default SpecialisationStep;
