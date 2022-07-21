import React, { useState } from "react";
import { Select } from "antd";

const NodeSearchBar = ({ courses, onSelect }) => {
  const [value, setValue] = useState(null);

  const handleSelect = (courseCode) => {
    onSelect(courseCode);
    setValue(null);
  };

  return (
    <Select
      showSearch
      placeholder="Search for a course..."
      filterOption
      size="large"
      options={courses.map((v) => ({ label: `${v[0]}: ${v[1]}`, value: v[0] }))}
      value={value}
      // open attribute - close search dropdown when there is no input value or
      // when a course has been selected
      open={Boolean(value)}
      onSearch={(code) => setValue(code ?? null)}
      onSelect={handleSelect}
      notFoundContent={value}
      style={{ width: "30rem" }}
      showArrow={!!value}
    />
  );
};

export default NodeSearchBar;
