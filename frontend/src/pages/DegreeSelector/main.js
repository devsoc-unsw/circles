import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updateDegree } from '../../actions/updateDegree'
import { courseOptionsActions } from '../../actions/courseOptionsActions';
import { Typography } from 'antd';
import { Button } from 'antd';
import './main.less';

function DegreeSelector() {
  const { Option } = Select;
  const { Title } = Typography;
  const degreeselect = ['Bachelor of Arts', 
    'Bachelor of Computer Science',
    'Bachelor of Commerce',
    'Bachelor of Commerce/Law',
    'Bachelor of Engineering (Honours)',
    'Bachelor of Medical Studies/Doctor of Medicine'
  ]
  
  const dispatch = useDispatch();
  const history = useHistory();
  const savedDegree = useSelector(store => store.degree);
  const [degree, setDegree] = useState(savedDegree ? savedDegree : '');


  const handleNext = () => {
    // Updates user degree
    dispatch(updateDegree(degree))
    
    // TODO: fetch core courses 
    // TODO: Make loading animation whilst this is happening
    // Initiate all core courses for this degree
    const dummyCoreCourses = ['COMP1511', 'COMP1521', 'COMP1531', 'COMP2511'];
    dispatch(courseOptionsActions('SET_CORE_COURSES', dummyCoreCourses))
    history.push('/course-selector');
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }}>
      <Title className={"text"} align="center">
          <Select
            size={'large'}
            bordered={false}
            className={'text selector'}
            onChange={ value => setDegree(value) } 
            showSearch
            style={{ width: '30%' }}
            defaultValue={degree === '' ? null : degree}
            placeholder="Select Degree"
            optionFilterProp="children"
            filterOption={(input, option) => 
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
          >
            {degreeselect.map((degreeselect,index)=>
              <Option className={'text option'} key={index} value={degreeselect}>
                {degreeselect}
              </Option>
            )}
          </Select>
        <Button type="primary" 
          shape="round" 
          size={'large'}
          onClick={handleNext}
          disabled={degree === ''}
        >
          Start Planning
        </Button>
      </Title>
    </div>
  );
}

export default DegreeSelector;