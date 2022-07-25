import React, { useState } from "react";
import { Select } from "antd";

const NodeSearchBar = ({ courses, onSelect }) => {
  const [value, setValue] = useState(null);

  const handleSelect = (courseCode) => {
    onSelect(courseCode);
    setValue(null);
  };

  // TODO: make this actually show course titles, or just convert to the BE search
  return (
    <Select
      showSearch
      placeholder="Search for a course..."
      filterOption
      size="large"
      options={courses.map((v) => ({ label: `${v}`, value: v }))}
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
