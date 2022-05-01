/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Spin } from "antd";
import axios from "axios";
import { useDebounce } from "use-debounce";
import prepareUserPayload from "./helper";
import { addTab } from "../../reducers/courseTabsSlice";

export const search = async (query, setCourses, setIsLoading, degree, planner) => {
  try {
    const res = await axios.post(
      `/courses/searchCourse/${query}`,
      JSON.stringify(prepareUserPayload(degree, planner)),
    );
    setCourses(
      Object.keys(res.data).map((course) => ({
        label: `${course}: ${res.data[course]}`,
        value: course,
      })),
    );
  } catch (err) {
    console.log(err);
  }
  setIsLoading(false);
};

const SearchCourse = () => {
  const [value, setValue] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm] = useDebounce(value, 200);

  const dispatch = useDispatch();

  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);

  useEffect(() => {
    // if debounced term changes , call API
    if (debouncedSearchTerm) {
      search(debouncedSearchTerm, setCourses, setIsLoading, degree, planner);
    }
  }, [debouncedSearchTerm, degree, planner]);

  const handleSelect = (courseCode) => {
    setValue(null);
    dispatch(addTab(courseCode));
  };

  const handleSearch = (courseCode) => {
    setValue(courseCode || null);
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
      // open attribute - close search dropdown when there is no input value or
      // when a course has been selected
      open={!!value}
      onSearch={handleSearch}
      onSelect={handleSelect}
      notFoundContent={isLoading && value && <Spin size="small" />}
      style={{ width: "30rem", marginRight: "0.5rem" }}
      showArrow={!!value}
    />
  );
};

export default SearchCourse;
