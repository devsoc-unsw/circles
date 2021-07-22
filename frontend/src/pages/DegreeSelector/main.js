import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Select } from 'antd';
import { Typography } from 'antd';
import { Button } from 'antd';
import './main.less';
import { useDispatch } from 'react-redux';
import { updateDegree } from '../../actions/updateDegree';

function DegreeSelector() {
  const { Option } = Select;
  const { Title } = Typography;
  const degreetype = ['Undergraduate','Postgraduate']
  const degreeselect = ['Bachelor of Arts', 
    'Bachelor of Computer Science',
    'Bachelor of Commerce',
    'Bachelor of Commerce/Law',
    'Bachelor of Engineering (Honours)',
    'Bachelor of Medical Studies/Doctor of Medicine'
  ]
  
  const history = useHistory();
  const dispatch = useDispatch();
  const [degreeState, setdegreeState] = useState('');
  const [degreetypeState, setdegreetypeState] = useState('');

  const onButtonClick= (e) => {
    // Simulating a change, you still need to implement this 
    const dummy_degree = {
      code: "3556", 
      name: "This is a dummy degree"
    }
    dispatch(updateDegree(dummy_degree))
    history.push('/course-selector');
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }}>
      <Title className={"text"} align="center">
        I am a(n) <span></span>
          <Select

            bordered={false}
            className={'text selector'}
            placeholder="Undergraduate"
            onChange={(value)=>{
              setdegreetypeState(value);
            }} 
          >
            {degreetype.map((degreetype,index)=>
              <Option className={'text option'} key={index} value={degreetype}>
                {degreetype}
              </Option>
            )}
          </Select>
          <span></span> student <span></span>
        <p> studying a <span></span>
          <Select
            bordered={false}
            className={'text selector'}
            onChange={ value => setdegreeState(value) } 
            showSearch
            style={{ width: '30%' }}
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
          <span></span> degree
        </p>
        <Button type="primary" 
            shape="round" 
            size={'large'}
            onClick={onButtonClick}
            disabled={degreeState==='' || degreetypeState===''}
            >
            Start Planning
        </Button>
      </Title>
    </div>
  );
}

export default DegreeSelector;