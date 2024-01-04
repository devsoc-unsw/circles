import React, { useCallback, useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import type { MenuProps } from 'antd';
import { Button, Typography } from 'antd';
import axios from 'axios';
import { Specialisations } from 'types/api';
import { DegreeWizardPayload } from 'types/degreeWizard';
import openNotification from 'utils/openNotification';
import Spinner from 'components/Spinner';
import springProps from '../common/spring';
import Steps from '../common/steps';
import CS from '../common/styles';
import S from './styles';

const { Title } = Typography;

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type Props = {
  incrementStep: (stepTo?: Steps) => void;
  currStep?: boolean;
  type: string;
  degreeInfo: DegreeWizardPayload;
  setDegreeInfo: SetState<DegreeWizardPayload>;
};

type Specialisation = {
  [spec: string]: {
    is_optional?: boolean;
    specs: Record<string, string>;
    notes: string;
  };
};

const SpecialisationStep = ({
  incrementStep,
  currStep,
  type,
  degreeInfo,
  setDegreeInfo
}: Props) => {
  const props = useSpring(springProps);
  const [options, setOptions] = useState<Specialisation | null>(null);

  const handleAddSpecialisation = (specialisation: string) => {
    setDegreeInfo((prev) => ({
      ...prev,
      specs: [...prev.specs, specialisation]
    }));
  };

  const handleRemoveSpecialisation = (specialisation: string) => {
    setDegreeInfo((prev) => ({
      ...prev,
      specs: prev.specs.filter((spec) => spec !== specialisation)
    }));
  };

  const fetchAllSpecialisations = useCallback(async () => {
    try {
      const res = await axios.get<Specialisations>(
        `/specialisations/getSpecialisations/${degreeInfo.programCode}/${type}`
      );
      setOptions(res.data.spec);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at getSteps', e);
    }
  }, [degreeInfo.programCode, type]);

  useEffect(() => {
    if (degreeInfo.programCode) fetchAllSpecialisations();
  }, [fetchAllSpecialisations, degreeInfo.programCode, type]);

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
      if (!isOptional || degreeInfo.specs.some((spec) => Object.keys(optionSpecs).includes(spec))) {
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
        !degreeInfo.specs.some((spec) => Object.keys(optionSpecs).includes(spec)) &&
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
            data-testid="menu"
            onSelect={(e) => handleAddSpecialisation(e.key)}
            onDeselect={(e) => handleRemoveSpecialisation(e.key)}
            selectedKeys={degreeInfo.specs}
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
