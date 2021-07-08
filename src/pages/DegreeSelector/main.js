import React from 'react';
import 'antd/dist/antd.css';
// import './index.css';
import { Select } from 'antd';

export default function DegreeSelector() {
  return (
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
    <Select value="1">Bachelor of Arts</Select>
    <Select value="2">Bachelor of Commerce</Select>
    <Select value="3">Bachelor of Computer Science</Select>
    <Select value="4">Bachelor of Medical Studies/Doctor of Medicine</Select>
    <Select value="5">Bachelor of Science</Select>
    <Select value="6">Bachelor of Engineering (Honours)</Select>
  </Select>
  );
}