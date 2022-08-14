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
  <S.CourseGroup>
    {courses.map((course) => (
      <CourseBadge
        courseCode={course.key}
        title={course.title}
        past={course.past}
        termPlanned={course.termPlanned}
        uoc={course.uoc}
        unplanned={course.unplanned}
      />
    ))}
  </S.CourseGroup>
);

type CoursesSectionProps = {
  title: string
  subgroupEntries: GridSubgroupCourse[]
  hasLotsOfCourses: boolean
};

const CoursesSection = ({ title, subgroupEntries, hasLotsOfCourses }: CoursesSectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const courses = subgroupEntries.filter((course) => !course.termPlanned && !course.unplanned);
  const coursesInPlanner = subgroupEntries.filter((course) => course.termPlanned);

  if (hasLotsOfCourses && subgroupEntries.length) {
    // show planned courses and view all modal
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

  const plannedUOC = subgroupEntries
    .filter((course) => course.termPlanned)
    .reduce((sum, course) => (sum + (course.uoc ?? 0)), 0);

  return (
    <div key={subgroupKey}>
      <Title level={2} className="text">{subgroupKey}</Title>
      <Title level={3} className="text">{uoc} UOC of the following courses ({Math.max(uoc - plannedUOC, 0)} UOC remaining)</Title>
      <CoursesSection
        title={subgroupKey}
        hasLotsOfCourses={hasLotsOfCourses}
        subgroupEntries={subgroupEntries}
      />
      <br />
    </div>
  );
};

export default GridViewSubgroup;
