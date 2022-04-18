import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import { useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import { search } from "../../CourseSelector/SearchCourse";

const MultiSelectCourse = ({
  plannedCourses,
  setPlannedCourses,
}) => {
  const [courseResults, setCourseResults] = useState([]);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm] = useDebounce(value, 200);

  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);

  useEffect(() => {
    if (debouncedSearchTerm) {
      search(debouncedSearchTerm, setCourseResults, setIsLoading, degree, planner);
    }
  }, [debouncedSearchTerm, degree, planner]);

  const handleSelect = (courseCode) => {
    const newCourse = { label: courseCode, value: courseCode, key: courseCode };
    setPlannedCourses([...plannedCourses, newCourse]);
  };

  const handleSelectionChange = (newSelectedCourses) => {
    const newValues = newSelectedCourses.map(
      (courseCode) => ({ label: courseCode, value: courseCode, key: courseCode }),
    );
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
};

export default MultiSelectCourse;
