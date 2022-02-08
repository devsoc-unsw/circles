import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Select } from 'antd';
import { Typography } from 'antd';
import { Button } from 'antd';

function SelectorMenu() {
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
  const specialisationselect = ['Computer Science','Database Systems',
    'eCommerceSystems','Artificial Intelligence','Programming Languages',
    'Computer Networks','Embedded System','Security Engineering'
  ]
  
  const history = useHistory();
  const [degreeState, setdegreeState] = useState('');
  const [degreetypeState, setdegreetypeState] = useState('');
  const [specialisationState, setspecialisationState] = useState('');

  const onButtonClick=(e)=>{
    history.push('/course-selector');
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }}>
      <Title className={"text"} align="center">
        I am a(n) <span></span>
          <Select
            style={{ width: '20%' }}
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
        <p/>
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
        <p> specialising in <span></span>
          <Select
            bordered={false}
            className={'text selector'}
            onChange={ value => setspecialisationState(value) } 
            showSearch
            style={{ width: '20%' }}
            placeholder="Select Specialisation"
            optionFilterProp="children"
            filterOption={(input, option) => 
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
          >
            {specialisationselect.map((specialisationselect,index)=>
              <Option className={'text option'} key={index} value={specialisationselect}>
                {specialisationselect}
              </Option>
            )}
          </Select>
          <span></span>
        </p>
        <Button type="primary" 
            shape="round" 
            size={'large'}
            onClick={onButtonClick}
            disabled={degreeState==='' || degreetypeState==='' || specialisationState===''}
            >
            Start Planning
        </Button>
      </Title>
    </div>
  );
}

export default SelectorMenu;