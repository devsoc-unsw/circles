import React, { useCallback, useState } from 'react';
import riveWASMResource from '@rive-app/canvas/rive.wasm?url';
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
  useStateMachineInput
} from '@rive-app/react-canvas';
import Section from './Section';
import S from './styles';

RuntimeLoader.setWasmUrl(riveWASMResource);

const HowToUse = () => {
  const [isVisible, setIsVisible] = useState(false);

  const { RiveComponent, rive } = useRive({
    src: 'toggleAnimation.riv',
    stateMachines: 'toggle-animation',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center
    })
  });

  const toggleState = useStateMachineInput(rive, 'toggle-animation', 'level');

  const sectionChange = useCallback(
    (number: string) => {
      if (toggleState) {
        toggleState.value = parseInt(number, 16) - 1;
        setIsVisible(true);
      }
    },
    [toggleState]
  );

  return (
    <S.StyledWrapper>
      <S.Title>How it works</S.Title>
      <S.SectionContainer>
        <S.Left>
          <Section number="01" heading="Degree Wizard" onChange={sectionChange}>
            Setup your degree using our wizard! Calibrate your degree to your liking! Choose from a
            selection of supported degrees to start with!
          </Section>
          <Section number="02" heading="Course Selector" onChange={sectionChange}>
            Search and select relevent courses to your degree or general education. Get a general
            overview of pre-requisites and requirements to do these courses and add them to your
            term planner!
          </Section>
          <Section number="03" heading="Term Planner" onChange={sectionChange}>
            Get ahead of the game! Drag and drop your chosen courses into the available term
            offering slots to plan ahead for your degree.
          </Section>
          <Section number="04" heading="Progression Checker" onChange={sectionChange}>
            Track your progress in your degree with our fluid progression checker, and view
            mandatory courses from an interactive representation of your degree plan!
          </Section>
        </S.Left>
        <S.Right>
          <S.RightSection>
            <S.SVGContainer
              style={{
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s'
              }}
            >
              <RiveComponent />
            </S.SVGContainer>
          </S.RightSection>
        </S.Right>
      </S.SectionContainer>
    </S.StyledWrapper>
  );
};

export default HowToUse;
