import React, { Dispatch, SetStateAction, useState } from 'react';
import { FaSortAlphaDown, FaSortNumericDown } from 'react-icons/fa';
import { Tooltip } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import { sortByAlphaNumeric, sortByLevel, SortFn } from 'utils/sortCourses';
import CourseBadge from '../CourseBadge';
import S from './styles';

type Props = {
  title: string
  courses: ViewSubgroupCourse[]
  modalVisible: boolean
  setModalVisible: Dispatch<SetStateAction<boolean>>
};

const CoursesModal = ({
  title, courses, modalVisible, setModalVisible,
}: Props) => {
  const [sortFn, setSortFn] = useState(SortFn.AlphaNumeric);

  const applySortFn = sortFn === SortFn.AlphaNumeric ? sortByAlphaNumeric : sortByLevel;

  return (
    <S.CourseModal
      title={(
        <S.ModalHeader>
          <S.ModalTitle level={2}>{title}</S.ModalTitle>
          <S.Instruction>See available courses:</S.Instruction>
        </S.ModalHeader>
    )}
      width="625px"
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
    >
      <S.SortBtnWrapper>
        <Tooltip title="Sort by Alphabet">
          <FaSortAlphaDown color={sortFn === SortFn.AlphaNumeric ? '#9254de' : undefined} onClick={() => setSortFn(SortFn.AlphaNumeric)} />
        </Tooltip>
        <Tooltip title="Sort by Course Level">
          <FaSortNumericDown color={sortFn === SortFn.Level ? '#9254de' : undefined} onClick={() => setSortFn(SortFn.Level)} />
        </Tooltip>
      </S.SortBtnWrapper>
      <S.CourseList>
        {courses.sort(applySortFn).map((course) => (
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
        ))}
      </S.CourseList>
    </S.CourseModal>
  );
};

export default CoursesModal;
