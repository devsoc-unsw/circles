import React from 'react';
import { useHistory } from 'react-router-dom';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updateDegree } from '../../actions/updateDegree'
import { courseOptionsActions } from '../../actions/courseOptionsActions';
import { Typography } from 'antd';
import { Button } from 'antd';
import './main.less';

function DegreeSelector() {
  const programs = {
    "3778": "Bachelor of Computer Science"
  }
  
  const dispatch = useDispatch();
  const history = useHistory();
  const degree = useSelector(store => store.degree);
  console.log(degree);
  const [program, setProgram] = React.useState(degree.program ? degree.program : null);
  // const [specialisation, setSpecialisation] = useState(degree.specialisation ? degree.specialisation : "");

  const handleNext = () => {
    // Updates user degree
    dispatch(updateDegree({
      program: program,
      specialisation: null // TEmporarily null until you implement specialisation
    }))
    
    // TODO: fetch core courses 
    // TODO: Make loading animation whilst this is happening
    // Initiate all core courses for this degree
    const dummyCoreCourses = ['COMP1511', 'COMP1521', 'COMP1531', 'COMP2511'];
    dispatch(courseOptionsActions('SET_CORE_COURSES', dummyCoreCourses))
    history.push('/course-selector');
  }

  const handleChange = (code) => {
    setProgram({
      code: code,
      name: programs.code
    })
  }

  return (
    <div className='degree-selector-root'>
      <Select
        size={'large'}
        className={'text selector'}
        bordered={false}
        onChange={ handleChange } 
        showSearch
        style={{ width: '30%' }}
        defaultValue={program === null ? null : `${program.code}`}
        placeholder="Select Degree"
        filterOption={(input, option) => 
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        filterSort={(optionA, optionB) =>
          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
        }
      >
        { Object.keys(programs).map((code, i) => <Select className={'text option'} key={i} value={code}>{code } - {programs[code]}</Select> )}
      </Select>
      <Button
        className='next-btn' 
        type="primary" 
        shape="round" 
        size='large'
        onClick={handleNext}
        disabled={ program === null}
      >
        Start Planning
      </Button>
    </div>
  );
}

export default DegreeSelector;