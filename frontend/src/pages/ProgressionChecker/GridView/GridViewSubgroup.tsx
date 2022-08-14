import React, { useState } from 'react';
import { Button, Empty, Typography } from 'antd';
import CourseBadge from '../CourseBadge';
import CourseListModal from '../CourseListModal';
import S from './styles';
import { GridSubgroupCourse } from './types';

type SubgroupSectionProps = {
  courses: GridSubgroupCourse[]
};

const SubgroupSection = ({ courses }: SubgroupSectionProps) => (
  <S.CourseGroup>{courses.map((course) => (
    <CourseBadge course={course} key={course.key} />
  ))}
  </S.CourseGroup>
);

type CourseSectionProps = {
  title: string
  subgroupEntries: GridSubgroupCourse[]
  hasLotsOfCourses: boolean
};

const CourseSection = ({ title, subgroupEntries, hasLotsOfCourses }: CourseSectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const coursesInPlanner = subgroupEntries.filter((course) => course.termPlanned
  || course.unplanned);
  const courses = subgroupEntries.filter((course) => !course.termPlanned && !course.unplanned);

  if (hasLotsOfCourses && subgroupEntries.length) {
    return (
      <>
        <SubgroupSection courses={coursesInPlanner} />
        <S.ViewAllCoursesWrapper>
          <Button type="primary" onClick={() => setModalVisible(true)}>
            View All Courses
          </Button>
          <CourseListModal
            title={title}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            courses={courses}
          />
        </S.ViewAllCoursesWrapper>
      </>
    );
  }

  if (subgroupEntries.length) return <SubgroupSection courses={subgroupEntries} />;

  return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

type Props = {
  uoc: number
  subgroupKey: string
  subgroupEntries: GridSubgroupCourse[]
  hasLotsOfCourses: boolean
};

const GridViewSubgroup = ({
  uoc,
  subgroupKey,
  subgroupEntries,
  hasLotsOfCourses,
}: Props) => {
  const { Title } = Typography;

  const plannedUOC = subgroupEntries.reduce((sum, course) => (sum + (course.uoc ?? 0)), 0);

  return (
    <div key={subgroupKey}>
      <Title level={2} className="text">{subgroupKey}</Title>
      <Title level={3} className="text">{uoc} UOC of the following courses ({Math.max(uoc - plannedUOC, 0)} UOC remaining)</Title>
      <CourseSection
        title={subgroupKey}
        hasLotsOfCourses={hasLotsOfCourses}
        subgroupEntries={subgroupEntries}
      />
      <br />
    </div>
  );
};

export default GridViewSubgroup;
