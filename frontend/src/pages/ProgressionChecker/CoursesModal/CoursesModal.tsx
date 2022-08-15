import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import { ViewSubgroupCourse } from 'types/progressionViews';
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
}: Props) => (
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
    <S.CourseList>
      {courses.map((course) => (
        <CourseBadge
          courseCode={course.courseCode}
          title={course.title}
          uoc={course.UOC}
          plannedFor={course.plannedFor}
          isUnplanned={course.isUnplanned}
          isMultiterm={course.isMultiterm}
          isDoubleCounted={course.isDoubleCounted}
        />
      ))}
    </S.CourseList>
  </S.CourseModal>
);

export default CoursesModal;
