import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import { Select } from 'antd';

const { Option } = Select;

ReactDOM.render(
  <Select
    showSearch
    style={{ width: 200 }}
    placeholder="Search to Select"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    filterSort={(optionA, optionB) =>
      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
    }
  >
    <Option value="1">Bachelor of Arts</Option>
    <Option value="2">Bachelor of Commerce</Option>
    <Option value="3">Bachelor of Computer Science</Option>
    <Option value="4">Bachelor of Medical Studies/Doctor of Medicine</Option>
    <Option value="5">Bachelor of Science</Option>
    <Option value="6">Bachelor of Engineering (Honours)</Option>
  </Select>,
  document.getElementById('container'),
);