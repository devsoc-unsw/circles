import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Spin } from 'antd';
import { courseOptionsActions } from '../../actions/courseOptionsActions';
import { setCourses } from '../../actions/updateCourses';
import debounce from 'lodash/debounce';
import axios from 'axios';

// const { Option } = Select;

// export default function SearchCourse(props) {
//   const dispatch = useDispatch();
//   const history = useHistory();
//   const courses = useSelector(state => state.updateCourses.courses);

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     const res = await axios.get('http://localhost:3000/courses.json');
//     dispatch(setCourses(res.data));
//   }

//   // fetchCourses();

//   console.log('RAIN', courses)

//   function onChange(value, { data }) {
//     dispatch(courseOptionsActions('APPEND_COURSE', {
//       [value]: {
//         title: data.name,
//         type: data.type,
//         termsOffered: data.terms,
//         prereq: data.prereq
//       }
//     }));
//     console.log(`selected ${value}`, data);
//     history.push(`/course-selector/${value}`);
//   }
  
//   function onBlur() {
//     console.log('blur');
//   }
  
//   function onFocus() {
//     console.log('focus');
//   }
  
//   function onSearch(val) {
//     console.log('search:', val);
//   }

//   return (
//     <Select
//       showSearch
//       className="text"
//       style={{ width: '20rem', marginRight: '0.5rem' }}
//       placeholder="Find a course"
//       optionFilterProp="children"
//       onChange={onChange}
//       onFocus={onFocus}
//       onBlur={onBlur}
//       onSearch={onSearch}
//       filterOption={(input, option) =>
//         option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//       }
//     >
//       {
//         Object.keys(courses).map(course => {
//           return (
//             <Option className={"text"} value={ course } data={ courses[course] }>{ course }</Option>
//           )
//         })
//       }
//     </Select>
//   );
// }

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



export default function SearchCourse() {
  const [value, setValue] = useState([]);

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
      // mode="multiple"
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