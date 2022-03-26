import React, { useState, useRef, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Spin } from "antd";
import { setCourses } from "../../../actions/coursesActions";
import debounce from "lodash/debounce";
import axios from "axios";
import { useDebounce } from "../../../hooks/useDebounce";

export default function DebouncingSelect({ setPlannedCourses }) {
  const [courses, setCourses] = React.useState([]);
  const [selectedCourses, setSelectedCourses] = useState({});

  useEffect(() => {
    // setPlannedCourses(selectedCourses);
  }, [selectedCourses]);

  // return (
  //   <DebounceSelect
  //     mode="multiple"
  //     value={value}
  //     placeholder="Search a course"
  //     fetchOptions={fetchUserList}
  //     onChange={(newValue) => {
  //       setValue(newValue);
  //     }}
  //     style={{ width: "20rem", marginRight: "0.5rem" }}
  //   />

  const [value, setValue] = React.useState("");
  const debouncedSearchTerm = useDebounce(value, 500);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // if debounced term changes , call API
    if (debouncedSearchTerm) search(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  async function search(query) {
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
  }

  const handleSelect = (courseCode) => {
    // setValue(courseCode);
    // dispatch(courseTabActions("ADD_TAB", courseCode));
  };

  function prepareSelectedCourses() {
    return Object.keys(selectedCourses).map((course) => ({
      label: course,
      value: course,
    }));
  }

  console.log(selectedCourses);

  return (
    <Select
      mode="multiple"
      showSearch
      placeholder="Search for a course..."
      filterOption={false}
      size="large"
      fetchOptions={prepareSelectedCourses}
      value={value}
      onSearch={(newVal) => {
        setValue(newVal);
      }}
      onSelect={handleSelect}
      notFoundContent={isLoading && value && <Spin size="small" />}
      style={{ width: "30rem", marginRight: "0.5rem" }}
    />
  );
}
