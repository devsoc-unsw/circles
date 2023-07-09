import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Select, Spin } from 'antd';
import { badDegree, badPlanner, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { useDebounce } from 'use-debounce';
import { handleSearchCourse } from 'utils/api/courseApi';
import { getUserDegree, getUserPlanner } from 'utils/api/userApi';

type Props = {
  onSelectCallback: (courseCode: string) => void;
  style?: React.CSSProperties;
};

const CourseSearchBar = ({ onSelectCallback, style }: Props) => {
  const [value, setValue] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(value, 200);

  const plannerQuery = useQuery('planner', getUserPlanner);
  const degreeQuery = useQuery('degree', getUserDegree);
  const planner: PlannerResponse = plannerQuery.data || badPlanner;
  const degree: DegreeResponse = degreeQuery.data || badDegree;

  useEffect(() => {
    const searchCourse = async (query: string) => {
      try {
        const res = await handleSearchCourse(query, degree, planner);
        setCourses(
          Object.keys(res).map((course) => ({
            label: `${course}: ${res[course]}`,
            value: course
          }))
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error at searchCourse', err);
      }
      setIsLoading(false);
    };

    if (debouncedSearchTerm) {
      // if debounced term changes, call API
      searchCourse(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, degree, planner]);

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
      showArrow={!!value}
    />
  );
};

export default CourseSearchBar;
