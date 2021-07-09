import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import 'antd/dist/antd.css';
import { Select } from 'antd';
import { Typography } from 'antd';
import { Button } from 'antd';

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
  const [degreeState,setdegreeState] = useState('');
  const [degreetypeState,setdegreetypeState] = useState('');

  const onButtonClick=(e)=>{
    history.push('/course-selector');
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }}>
      <Title className = "text" align="center">
        I am an <span></span>
          <Select
            placeholder="Undergraduate"
            onChange={(value)=>{
              setdegreetypeState(value);
            }} 
          >
            {degreetype.map((degreetype,index)=>{
              return <Option key={index} value={degreetype}>
                {degreetype}
                </Option>
            })}
          </Select>
          <span></span> student <span></span>
        <p> studying a <span></span>
          <Select
            className="degreeSelect"
            onChange={(value)=>{
              setdegreeState(value);
              // console.log(degreeState)
            }} 
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
            {degreeselect.map((degreeselect,index)=>{
              return <Option key={index} value={degreeselect}>
                {degreeselect}
                </Option>
            })}
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