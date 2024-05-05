import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { useDebounce } from 'use-debounce';
import { searchCourse } from 'utils/api/courseApi';
import useToken from 'hooks/useToken';

type Props = {
  onSelectCallback: (courseCode: string) => void;
  style?: React.CSSProperties;
};

const CourseSearchBar = ({ onSelectCallback, style }: Props) => {
  const [value, setValue] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(value, 200);
  const token = useToken();

  useEffect(() => {
    const handleSearchCourse = async (query: string) => {
      try {
        const res = await searchCourse(token, query);
        setCourses(
          Object.keys(res).map((course) => ({
            label: `${course}: ${res[course]}`,
            value: course
          }))
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error at handleSearchCourse: ', err);
      }
      setIsLoading(false);
    };

    if (debouncedSearchTerm) {
      // if debounced term changes, call API
      handleSearchCourse(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, token]);

  const handleSelect = (courseCode: string) => {
    setValue(null);
    onSelectCallback(courseCode);
  };

  const handleSearch = (courseCode: string) => {
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
      // open attribute - close search dropdown when there is no input value or
      // when a course has been selected
      open={!!value}
      onSearch={handleSearch}
      onSelect={handleSelect}
      notFoundContent={isLoading && value && <Spin size="small" />}
      style={{ width: '30rem', ...style }}
      suffixIcon={!value}
      className="course-search-bar"
    />
  );
};

export default CourseSearchBar;
