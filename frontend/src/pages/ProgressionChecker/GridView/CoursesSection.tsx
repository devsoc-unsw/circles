import React, { useState } from 'react';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import { ViewSubgroupCourse } from 'types/progressionViews';
import CourseBadge from '../CourseBadge';
import CourseListModal from '../CoursesModal';
import S from './styles';

type CoursesSectionProps = {
  title: string
  plannedCourses: ViewSubgroupCourse[]
  unplannedCourses: ViewSubgroupCourse[]
  isCoursesOverflow?: boolean
};

const CoursesSection = ({
  title, plannedCourses, unplannedCourses, isCoursesOverflow,
}: CoursesSectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (isCoursesOverflow) {
    // show planned courses and view all modal
    return (
      <>
        <S.CourseGroup>
          {plannedCourses.map((course) => (
            <CourseBadge
              courseCode={course.courseCode}
              title={course.title}
              plannedFor={course.plannedFor}
              uoc={course.UOC}
              isUnplanned={course.isUnplanned}
              isMultiterm={course.isMultiterm}
            />
          ))}
        </S.CourseGroup>
        <S.ViewAllCoursesWrapper>
          <Button type="primary" onClick={() => setModalVisible(true)}>
            View Courses
          </Button>
          <CourseListModal
            title={title}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            courses={unplannedCourses}
          />
        </S.ViewAllCoursesWrapper>
      </>
    );
  }

  const courses = [...plannedCourses, ...unplannedCourses];

  if (courses.length) {
    return (
      <S.CourseGroup>
        {courses.map((course) => (
          <CourseBadge
            courseCode={course.courseCode}
            title={course.title}
            plannedFor={course.plannedFor}
            uoc={course.UOC}
            isUnplanned={course.isUnplanned}
            isMultiterm={course.isMultiterm}
          />
        ))}
      </S.CourseGroup>
    );
  }

  return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

export default CoursesSection;
