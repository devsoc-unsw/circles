import React from 'react';
import ParticleBackground from './ParticleBackground';
import { useSelector } from 'react-redux';
import { DegreeStep } from './steps/DegreeStep';
import { SpecialisationStep } from './steps/SpecialisationStep';
import { PreviousCoursesStep } from './steps/PreviousCoursesStep';
import { MinorStep } from './steps/MinorStep';
import { plannerActions } from '../../actions/plannerActions';
import { useDispatch } from 'react-redux';
import { useSpring, animated } from 'react-spring';
import { DatePicker } from 'antd';
import './main.less';

const { RangePicker } = DatePicker;
function DegreeSelector() {
    const theme = useSelector(store => store.theme);
    const dispatch = useDispatch();
    const handleYearChange = (_, [startYear, endYear]) => {
      console.log(startYear, endYear);
      dispatch(plannerActions('SET_START_YEAR', startYear));
      dispatch(plannerActions('SET_YEARS', endYear - startYear));
    }
    const props = useSpring({
      from: { opacity: 0 },
      to: { opacity: 1 },
      reset: true,
      config: { tension: 80, friction: 60 },
    });

    return (
      <div className='degree-root-container'>
        <div className={"step-duration"}>
          <RangePicker 
            picker="year"
            size="large"
            onChange={handleYearChange} 
          />
        </div>
        <animated.div style={props}> 
          <div className="step-container">
            <div className="step-content" id={"Degree"}><DegreeStep/></div>
            <div className="step-content" id={"Specialisation"}><SpecialisationStep/></div>
            <div className="step-content" id={"Minor"}><MinorStep/></div>
            <div className="step-content" id={"Previous Courses"}><PreviousCoursesStep/></div>
          </div>
        </animated.div>
        { theme === 'dark' && <ParticleBackground />}
      </div>
    );
}
export default DegreeSelector;