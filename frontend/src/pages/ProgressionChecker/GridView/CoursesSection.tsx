import React, { useState } from 'react';
import { Button, Empty } from 'antd';
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
  const sortByAlphaNumeric = (courseA: ViewSubgroupCourse, courseB: ViewSubgroupCourse)
  : number => (courseA.courseCode
      > courseB.courseCode ? 1 : -1);

  const sortByLevel = (courseA: ViewSubgroupCourse, courseB: ViewSubgroupCourse)
  : number => {
    const courseALevel = courseA.courseCode.slice(4, 5);
    const courseBLevel = courseB.courseCode.slice(4, 5);
    if (courseALevel !== courseBLevel) return courseALevel > courseBLevel ? 1 : -1;
    return courseA.courseCode > courseB.courseCode ? 1 : -1;
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [courses, setCourses] = useState([...plannedCourses, ...unplannedCourses]
    .sort(sortByLevel));

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
              isDoubleCounted={course.isDoubleCounted}
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

  if (courses.length) {
    return (
      <S.CourseGroup>
        <Button onClick={() => setCourses([...plannedCourses, ...unplannedCourses]
          .sort(sortByAlphaNumeric))}
        >Sort by alpha
        </Button>
        <Button onClick={() => setCourses([...plannedCourses, ...unplannedCourses]
          .sort(sortByLevel))}
        >Sort By Levels
        </Button>
        {courses.map((course) => (
          <CourseBadge
            courseCode={course.courseCode}
            title={course.title}
            plannedFor={course.plannedFor}
            uoc={course.UOC}
            isUnplanned={course.isUnplanned}
            isMultiterm={course.isMultiterm}
            isDoubleCounted={course.isDoubleCounted}
          />
        ))}
      </S.CourseGroup>
    );
  }

  return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

export default CoursesSection;
