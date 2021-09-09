import React from 'react';
import ParticleBackground from './ParticleBackground';
import { Button, Timeline } from 'antd';
import { useSelector } from 'react-redux';
import { DegreeStep } from './steps/DegreeStep';
import { SpecialisationStep } from './steps/SpecialisationStep';
import { PreviousCoursesStep } from './steps/PreviousCoursesStep';
import { MinorStep } from './steps/MinorStep';
import { DurationStep } from './steps/DurationStep';
import { useDispatch } from 'react-redux';
import { degreeActions } from '../../actions/degreeActions';
import { useSpring, animated } from 'react-spring';
import './main.less';

function DegreeSelector() {
    const dispatch = useDispatch();
    const theme = useSelector(store => store.theme);
    const currStep = useSelector(store => store.degree.currStep);
    const steps = ["Degree", "Specialisation", "Minor", "Duration", "Previous Courses"];

    const props = useSpring({
      from: { opacity: 0 },
      to: { opacity: 1 },
      reset: true,
      config: { tension: 80, friction: 60 },
    });

    return (
      <div className='degree-root-container'>
        <Timeline className="steps-timeline-cont">
          { steps.map((step) => {
            console.log(step, currStep)
            if (step !== steps[currStep]) return <Timeline.Item color='grey'>{step}</Timeline.Item> 
            else return <Timeline.Item color='green'>{step}</Timeline.Item>
          })} 
        </Timeline>
        <animated.div style={props}> 
          <div>
            <div className="step-content" id={"Degree"}><DegreeStep/></div>
            <div className="step-content" id={"Specialisation"}><SpecialisationStep/></div>
            <div className="step-content" id={"Minor"}><MinorStep/></div>
            <div className="step-content" id={"Duration"}><DurationStep/></div>
            <div className="step-content" id={"Previous Courses"}><PreviousCoursesStep/></div>
          </div>
        </animated.div>
        { theme === 'dark' && <ParticleBackground />}
      </div>
    );
}
export default DegreeSelector;