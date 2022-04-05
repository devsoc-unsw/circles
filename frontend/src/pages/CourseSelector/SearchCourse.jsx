import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import axios from "axios";
import { courseTabActions } from "../../actions/courseTabActions";
import { useDebounce } from "../../hooks/useDebounce";

export default function SearchCourse() {
  const [value, setValue] = useState("");
  const debouncedSearchTerm = useDebounce(value, 200);
  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // if debounced term changes , call API
    if (debouncedSearchTerm)
      search(debouncedSearchTerm, setCourses, setIsLoading);
  }, [debouncedSearchTerm]);

  const handleSelect = (courseCode) => {
    setValue(courseCode);
    dispatch(courseTabActions("ADD_TAB", courseCode));
  };

  const handleSearch = (courseCode) => {
    setValue(courseCode);
    setCourses([]);
    setIsLoading(true);
  };

  return (
    <Select
      showSearch
      placeholder="Search for a course..."
      filterOption={false}
      size="large"
      options={courses}
      value={value}
      onSearch={handleSearch}
      onSelect={handleSelect}
      notFoundContent={isLoading && value && <Spin size="small" />}
      style={{ width: "30rem", marginRight: "0.5rem" }}
    />
  );
}

export const search = async (query, setCourses, setIsLoading) => {
  try {
    const res = await axios.get(`/courses/searchCourse/${query}`);
    setCourses(
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
};
