import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Select, Spin } from 'antd';
import { setCourses } from '../../../actions/updateCourses';
import debounce from 'lodash/debounce';
import axios from 'axios';

const DebounceSelect = ({ fetchOptions, debounceTimeout = 800, ...props }) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        const filteredOptions = newOptions.filter(option => option.value.toLowerCase().indexOf(value.toLowerCase()) >= 0);
        setOptions(filteredOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      showSearch
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
} // Usage of DebounceSelect


export default function DebouncingSelect({ setPlannedCourses }) {
  const [value, setValue] = useState([]);
  setPlannedCourses(value);

  const dispatch = useDispatch();
  const courses = useSelector(state => state.updateCourses.courses);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get('http://localhost:3000/courses.json');
    dispatch(setCourses(res.data));
  }

  async function fetchUserList() {
    return Object.keys(courses).map(course => ({
      label: course,
      value: course
    }));
  }

  return (
    <DebounceSelect
      mode="multiple"
      value={value}
      placeholder="Search a course"
      fetchOptions={fetchUserList}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      style={{ width: '20rem', marginRight: '0.5rem' }}
    />
  );
}
