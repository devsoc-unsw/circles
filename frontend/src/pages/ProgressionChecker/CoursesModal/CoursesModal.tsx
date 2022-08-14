import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import { GridSubgroupCourse, TableSubgroupCourse } from 'types/progressionViews';
import CourseBadge from '../CourseBadge';
import S from './styles';

type Props = {
  title: string
  courses: GridSubgroupCourse[] | TableSubgroupCourse[]
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
        <S.Instruction>See availiable courses:</S.Instruction>
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
          courseCode={course.key}
          title={course.title}
          termPlanned={course.termPlanned}
          // unplanned={course.unplanned}
        />
      ))}
    </S.CourseList>
  </S.CourseModal>
);

export default CoursesModal;
