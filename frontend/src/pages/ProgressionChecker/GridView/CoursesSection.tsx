import React, { useState } from 'react';
import { Button, Empty } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import CourseBadge from '../CourseBadge';
import CoursesModal from '../CoursesModal';
import S from './styles';

type CoursesSectionProps = {
  title: string
  plannedCourses: ViewSubgroupCourse[]
  unplannedCourses: ViewSubgroupCourse[]
  isCoursesOverflow?: boolean
  sortFn?: (courseA: ViewSubgroupCourse, courseB: ViewSubgroupCourse) => number
};

const CoursesSection = ({
  title, plannedCourses, unplannedCourses, isCoursesOverflow, sortFn,
}: CoursesSectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (isCoursesOverflow) {
    plannedCourses.sort(sortFn);
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
              isDoubleCounted={course.isDoubleCounted}
              isOverCounted={course.isOverCounted}
            />
          ))}
        </S.CourseGroup>
        {!!unplannedCourses.length && (
          <S.ViewAllCoursesWrapper>
            <Button type="primary" onClick={() => setModalVisible(true)}>
              View Courses
            </Button>
            <CoursesModal
              title={title}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              courses={unplannedCourses}
            />
          </S.ViewAllCoursesWrapper>
        )}
      </>
    );
  }

  const courses = [...plannedCourses, ...unplannedCourses].sort(sortFn);

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
            isDoubleCounted={course.isDoubleCounted}
            isOverCounted={course.isOverCounted}
          />
        ))}
      </S.CourseGroup>
    );
  }

  return <Empty className="text" description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

export default CoursesSection;
