import React, { Dispatch, SetStateAction, useState } from 'react';
import { FaSortAlphaDown, FaSortNumericDown } from 'react-icons/fa';
import { Input, Tooltip } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import { sortByAlphaNumeric, sortByLevel, SortFn } from 'utils/sortCourses';
import CourseBadge from '../CourseBadge';
import S from './styles';

type Props = {
  title: string;
  courses: ViewSubgroupCourse[];
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
};

const CoursesModal = ({ title, courses, modalVisible, setModalVisible }: Props) => {
  const [sortFn, setSortFn] = useState(SortFn.AlphaNumeric);
  const [filter, setFilter] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const applySortFn = sortFn === SortFn.AlphaNumeric ? sortByAlphaNumeric : sortByLevel;

  const courseList = courses
    .filter((course) =>
      course.courseCode
        .toLowerCase()
        .concat(course.title.toLowerCase())
        .includes(filter.toLowerCase())
    )
    .sort(applySortFn);

  return (
    <S.CourseModal
      title={
        <S.ModalHeader>
          <S.ModalTitle level={2}>{title}</S.ModalTitle>
          <S.Instruction>See available courses:</S.Instruction>
        </S.ModalHeader>
      }
      width="625px"
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
    >
      <S.FilterBarWrapper>
        <Input
          placeholder="Filter available courses"
          onChange={handleSearch}
          style={{ width: 500 }}
        />
        <Tooltip title="Sort by Alphabet">
          <FaSortAlphaDown
            color={sortFn === SortFn.AlphaNumeric ? '#9254de' : undefined}
            onClick={() => setSortFn(SortFn.AlphaNumeric)}
          />
        </Tooltip>
        <Tooltip title="Sort by Course Level">
          <FaSortNumericDown
            color={sortFn === SortFn.Level ? '#9254de' : undefined}
            onClick={() => setSortFn(SortFn.Level)}
          />
        </Tooltip>
      </S.FilterBarWrapper>
      <S.CourseList>
        {courseList.length > 0 ? (
          courseList.map((course) => (
            <CourseBadge
              courseCode={course.courseCode}
              title={course.title}
              uoc={course.UOC}
              plannedFor={course.plannedFor}
              isUnplanned={course.isUnplanned}
              isMultiterm={course.isMultiterm}
              isDoubleCounted={course.isDoubleCounted}
              isOverCounted={course.isOverCounted}
            />
          ))
        ) : (
          <S.PlaceholderWrapper>No courses available</S.PlaceholderWrapper>
        )}
      </S.CourseList>
    </S.CourseModal>
  );
};

export default CoursesModal;
