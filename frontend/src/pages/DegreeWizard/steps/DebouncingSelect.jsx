import React, { useState, useRef, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Spin } from "antd";
import { setCourses } from "../../../actions/coursesActions";
import debounce from "lodash/debounce";
import axios from "axios";
import { useDebounce } from "../../../hooks/useDebounce";

export default function DebouncingSelect({
  plannedCourses,
  setPlannedCourses,
}) {
  const [courseResults, setCourseResults] = React.useState([]);

  const [value, setValue] = React.useState("");
  const debouncedSearchTerm = useDebounce(value, 500);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // if debounced term changes , call API
    if (debouncedSearchTerm) search(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  async function search(query) {
    try {
      const res = await axios.get(`/courses/searchCourse/${query}`);
      setCourseResults(
        Object.keys(res.data).map((course) => ({
          label: `${course}: ${res.data[course]}`,
          value: course,
        }))
      );
    } catch (err) {
      console.log(err);
      return [];
    }
    setIsLoading(false);
  }

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
