import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import { useDebounce } from "../../../hooks/useDebounce";
import { search } from "../../CourseSelector/SearchCourse";

export default function MultiSelectCourse({
  plannedCourses,
  setPlannedCourses,
}) {
  const [courseResults, setCourseResults] = React.useState([]);

  const [value, setValue] = React.useState("");
  const debouncedSearchTerm = useDebounce(value, 200);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm)
      search(debouncedSearchTerm, setCourseResults, setIsLoading);
  }, [debouncedSearchTerm]);

  const handleSelect = (courseCode) => {
    const newCourse = { label: courseCode, value: courseCode, key: courseCode };
    setPlannedCourses([...plannedCourses, newCourse]);
  };

  const handleSelectionChange = (newSelectedCourses) => {
    const newValues = newSelectedCourses.map((courseCode) => {
      return { label: courseCode, value: courseCode, key: courseCode };
    });
    setPlannedCourses(newValues);
  };

  return (
    <Select
      mode="multiple"
      showSearch
      placeholder="Search for a course..."
      filterOption={false}
      size="large"
      options={courseResults}
      value={plannedCourses}
      onSearch={(newVal) => {
        setValue(newVal);
        setIsLoading(true);
      }}
      onChange={handleSelectionChange}
      onSelect={handleSelect}
      notFoundContent={isLoading && value && <Spin size="small" />}
      style={{ width: "30rem", marginRight: "0.5rem" }}
    />
  );
}
