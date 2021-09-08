import React, { useEffect } from 'react';
import ParticleBackground from './ParticleBackground';
import { Steps, Button } from 'antd';
import { useSelector } from 'react-redux';
import { DegreeStep } from './steps/DegreeStep';
import { SpecialisationStep } from './steps/SpecialisationStep';
import { MinorStep } from './steps/MinorStep';
import { DetailStep } from './steps/DetailStep';
import { useDispatch } from 'react-redux';
import { degreeActions } from '../../actions/degreeActions';
import { LeftOutlined } from '@ant-design/icons';
import './main.less';

const { Step } = Steps;
function DegreeSelector() {
    const dispatch = useDispatch();
    const theme = useSelector(store => store.theme);
    const currStep = useSelector(store => store.degree.currStep);

    return (
      <div className='degree-root-container'>
        <div className='degree-content'>
          <Steps className="step-style" current={currStep}>
            <Step title="Degree" />
            <Step title="Specialisation" />
            <Step title="Minor" />
            <Step title="Duration" />
          </Steps> 
          { currStep !== 0 && (
            <Button 
              className='steps-back-btn'
              icon={<LeftOutlined/>}
              onClick={() => dispatch(degreeActions('PREV_STEP'))}
            >
             Back 
            </Button> 
          )}
          <div className='step-content'>
            {currStep === 0 && <DegreeStep/> }
            {currStep === 1 && <SpecialisationStep/>}
            {currStep === 2 && <MinorStep/>}
            {currStep === 3 && <DetailStep/>}
          </div>
        </div>
        { theme === 'dark' && <ParticleBackground />}
      </div>
    );
}
export default DegreeSelector;