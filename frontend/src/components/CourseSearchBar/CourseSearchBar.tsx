import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, Spin } from 'antd';
import { SearchCourse } from 'types/api';
import { CoursesResponse } from 'types/userResponse';
import { useDebounce } from 'use-debounce';
import { searchCourse } from 'utils/api/courseApi';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';
import QuickAddCartButton from 'components/QuickAddCartButton';

type SearchResultLabelProps = {
  courseCode: string;
  courseTitle: string;
  isPlanned: boolean;
  runMutate?: (courseId: string) => void;
};

const SearchResultLabel = ({
  courseCode,
  courseTitle,
  runMutate,
  isPlanned
}: SearchResultLabelProps) => {
  const codeAndTitleText = `${courseCode}: ${courseTitle}`;

  return (
    <div title={codeAndTitleText}>
      <QuickAddCartButton courseCode={courseCode} runMutate={runMutate} planned={isPlanned} />
      <span style={{ marginLeft: '1ch' }}> {codeAndTitleText} </span>
    </div>
  );
};

type CourseSearchBarProps = {
  onSelectCallback: (courseCode: string) => void;
  style?: React.CSSProperties;
  userCourses?: CoursesResponse;
};

const CourseSearchBar = ({ onSelectCallback, style, userCourses }: CourseSearchBarProps) => {
  const [value, setValue] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchCourse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(value, 200);

  const isInPlanner = (courseCode: string) =>
    userCourses !== undefined &&
    userCourses[courseCode] !== undefined &&
    userCourses[courseCode].plannedFor !== null;

  const queryClient = useQueryClient();
  const courseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const handleMutation = isInPlanner(courseId) ? removeCourse : addToUnplanned;
      await handleMutation(courseId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      await queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });

  const courses = Object.entries(searchResults).map(([courseCode, courseTitle]) => ({
    label: (
      <SearchResultLabel
        courseCode={courseCode}
        courseTitle={courseTitle}
        isPlanned={isInPlanner(courseCode)}
        runMutate={courseMutation.mutate}
      />
    ),
    value: courseCode
  }));

  useEffect(() => {
    const handleSearchCourse = async (query: string) => {
      try {
        setSearchResults(await searchCourse(query));
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
  }, [debouncedSearchTerm]);

  const handleSelect = (courseCode: string) => {
    setValue(null);
    onSelectCallback(courseCode);
  };

  const handleSearch = (courseCode: string) => {
    setValue(courseCode);
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
      style={{ width: '55ch', ...style }}
      suffixIcon={!value}
      className="course-search-bar"
    />
  );
};

export default CourseSearchBar;
