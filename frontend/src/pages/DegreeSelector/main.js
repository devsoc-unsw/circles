import React from 'react';
import ParticleBackground from './ParticleBackground';
import { Steps } from 'antd';
import { useSelector } from 'react-redux';
import { DegreeStep } from './steps/DegreeStep';
import { SpecialisationStep } from './steps/SpecialisationStep';
import { MinorStep } from './steps/MinorStep';
import './main.less';
import { useDispatch } from 'react-redux';
import { updateDegree } from '../../actions/updateDegree';

const { Step } = Steps;
function DegreeSelector() {
    const theme = useSelector(store => store.theme);
    const currStep = useSelector(store => store.degree.currStep);
    console.log(currStep);
    return (
      <div className='degree-root-container'>
        <div className='degree-content'>
          <Steps className="step-style" current={currStep}>
            <Step title="Degree" />
            <Step title="Specialisation" />
            <Step title="Minor" />
          </Steps>  
          <div className='step-content'>
            {currStep === 0 && <DegreeStep/> }
            {currStep === 1 && <SpecialisationStep/>}
            {currStep === 2 && <MinorStep/>}
          </div>
        </div>
        { theme === 'dark' && <ParticleBackground />}
      </div>
    );
}
export default DegreeSelector;