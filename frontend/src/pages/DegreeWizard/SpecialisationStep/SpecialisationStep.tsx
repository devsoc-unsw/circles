import React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import type { MenuProps } from 'antd';
import { Button, Typography } from 'antd';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { getSpecialisationsForProgram } from 'utils/api/specsApi';
import Spinner from 'components/Spinner';
import useNotification from 'hooks/useNotification';
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

const SpecialisationStep = ({
  incrementStep,
  currStep,
  type,
  degreeInfo,
  setDegreeInfo
}: Props) => {
  const props = useSpring(springProps);

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

  const specsQuery = useQuery({
    queryKey: ['specialisations', degreeInfo.programCode, type],
    queryFn: () => getSpecialisationsForProgram(degreeInfo.programCode, type),
    select: (data) => data.spec,
    enabled: degreeInfo.programCode !== ''
  });
  const options = specsQuery.data;

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

  const notificationHandler = useNotification();

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
      notificationHandler.tryOpenNotification({
        name: 'missing-spec-error-notification',
        type: 'error',
        message: `Select a ${type.substring(0, type.length - 1)} for nothing`
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
