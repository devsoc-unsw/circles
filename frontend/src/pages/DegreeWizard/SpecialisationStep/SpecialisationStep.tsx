import React, { useCallback, useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import type { MenuProps } from 'antd';
import { Button, Typography } from 'antd';
import API from 'utils/api';
import openNotification from 'utils/openNotification';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import { useAppDispatch, useAppSelector } from 'hooks';
import { addSpecialisation, removeSpecialisation } from 'reducers/degreeSlice';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';
import S from './styles';

const { Title } = Typography;

type Props = {
  incrementStep: (stepTo?: Steps) => void;
  currStep?: boolean;
  type: string;
};

type Specialisation = {
  [spec: string]: {
    is_optional?: boolean;
    specs: Record<string, string>;
    notes: string;
  };
};

const SpecialisationStep = ({ incrementStep, currStep, type }: Props) => {
  const props = useSpring(springProps);
  const dispatch = useAppDispatch();
  const { programCode, specs } = useAppSelector((store: RootState) => store.degree);
  const [options, setOptions] = useState<Specialisation | null>(null);

  const fetchAllSpecialisations = useCallback(async () => {
    try {
      const res = await API.specialisations.specialisations(programCode, type);
      setOptions(res.data.spec);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at getSteps', e);
    }
  }, [programCode, type]);

  useEffect(() => {
    if (programCode) fetchAllSpecialisations();
  }, [fetchAllSpecialisations, programCode, type]);

  const menuItems: MenuProps['items'] = options
    ? Object.keys(options).map((program, index) => ({
        label: `${type.replace(/^\w/, (c) => c.toUpperCase())} for ${program}`,
        key: index,
        children: options[program].notes
          ? [
              {
                label: `Note: ${options[program].notes}`,
                type: 'group',
                children: Object.keys(options[program].specs)
                  .sort()
                  .map((spec) => ({
                    label: `${spec} ${options[program].specs[spec]}`,
                    key: spec
                  }))
              }
            ]
          : Object.keys(options[program].specs)
              .sort()
              .map((spec) => ({
                label: `${spec} ${options[program].specs[spec]}`,
                key: spec
              }))
      }))
    : undefined;

  // check if step is optional and can be skipped
  let optionalStep = true;
  if (options) {
    Object.keys(options).forEach((specKey) => {
      const { is_optional: isOptional, specs: optionSpecs } = options[specKey];
      if (!isOptional || specs.some((spec) => Object.keys(optionSpecs).includes(spec))) {
        optionalStep = false;
      }
    });
  }

  const handleOnNextClick = () => {
    if (!options) return;
    let missingSpec = '';
    Object.keys(options).forEach((specKey) => {
      const { is_optional: isOptional, specs: optionSpecs } = options[specKey];
      if (
        !isOptional &&
        !specs.some((spec) => Object.keys(optionSpecs).includes(spec)) &&
        !missingSpec
      ) {
        missingSpec = specKey;
      }
    });
    if (missingSpec) {
      openNotification({
        type: 'error',
        message: `Select a ${type.substring(0, type.length - 1)} for ${missingSpec}`
      });
    } else incrementStep();
  };

  return (
    <CS.StepContentWrapper id={type}>
      <animated.div style={props}>
        <CS.StepHeadingWrapper>
          <Title level={4} className="text">
            What are your {type}?
          </Title>
          {currStep && (
            <Button type="primary" onClick={handleOnNextClick}>
              {optionalStep ? 'Skip' : 'Next'}
            </Button>
          )}
        </CS.StepHeadingWrapper>
        {menuItems ? (
          <S.Menu
            onSelect={(e) => dispatch(addSpecialisation(e.key))}
            onDeselect={(e) => dispatch(removeSpecialisation(e.key))}
            selectedKeys={specs}
            defaultOpenKeys={['0']}
            mode="inline"
            style={{
              gap: '10px',
              display: 'flex',
              flexDirection: 'column'
            }}
            items={menuItems}
          />
        ) : (
          <Spinner text={`Loading ${type}...`} />
        )}
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default SpecialisationStep;
