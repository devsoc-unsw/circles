import React, { useState } from 'react';
import { Button, Empty, Typography } from 'antd';
import Collapsible from 'components/Collapsible';
import CourseBadge from '../CourseBadge';
import CourseListModal from '../CourseListModal';
import S from './styles';
import { GridSubgroupCourse, PlannedState } from './types';

type CollapsibleSectionProps = {
  title: string
  planState: PlannedState
  planned: GridSubgroupCourse[]
  unplanned: GridSubgroupCourse[]
  hasLotsOfCourses: boolean
};

const CollapsibleSection = ({
  title, planState, planned, unplanned, hasLotsOfCourses,
}: CollapsibleSectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  // convert lists to components
  const plannedGroup = (
    <S.CourseGroup>
      {planned.map((course) => (
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
  const unplannedGroup = (
    <S.CourseGroup>
      {unplanned.map((course) => (
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

  if (hasLotsOfCourses && planState === PlannedState.UNPLANNED) {
    return (
      <S.ViewAllCoursesWrapper>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          View All Courses
        </Button>
        <CourseListModal
          title={title}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          courses={unplanned}
        />
      </S.ViewAllCoursesWrapper>
    );
  }

  if (planState === PlannedState.PLANNED && planned.length > 0) {
    return plannedGroup;
  }

  if (planState === PlannedState.UNPLANNED && unplanned.length > 0) {
    return unplannedGroup;
  }

  return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

type Props = {
  uoc: number
  subgroupKey: string
  subgroupEntries: GridSubgroupCourse[]
  hasLotsOfCourses: boolean
};

const GridViewConciseSubgroup = ({
  uoc,
  subgroupKey,
  subgroupEntries,
  hasLotsOfCourses,
}: Props) => {
  const { Title } = Typography;

  const planned = subgroupEntries.filter((c) => (c.unplanned || c.past || c.past === false));
  const plannedUOC = planned.reduce((sum, course) => (sum + (course.uoc ?? 0)), 0);
  const unplanned = subgroupEntries.filter((c) => (!(c.unplanned || c.past || c.past === false)));

  return (
    <div key={subgroupKey}>
      <Title level={2} className="text">{subgroupKey}</Title>
      <Title level={3} className="text">{uoc} UOC of the following courses</Title>
      {!!subgroupEntries.length && (
        <>
          <Collapsible
            title={<Title level={4} className="text">You have {plannedUOC} UOC worth of courses planned</Title>}
            headerStyle={{ border: 'none' }}
            initiallyCollapsed={!planned.length}
          >
            <CollapsibleSection
              title={subgroupKey}
              planState={PlannedState.PLANNED}
              planned={planned}
              unplanned={unplanned}
              hasLotsOfCourses={hasLotsOfCourses}
            />
          </Collapsible>
          <Collapsible
            title={<Title level={4} className="text">Choose {Math.max(uoc - plannedUOC, 0)} UOC from the following courses</Title>}
            headerStyle={{ border: 'none' }}
            initiallyCollapsed={!hasLotsOfCourses && (unplanned.length > 16 || !unplanned.length)}
          >
            <CollapsibleSection
              title={subgroupKey}
              planState={PlannedState.UNPLANNED}
              planned={planned}
              unplanned={unplanned}
              hasLotsOfCourses={hasLotsOfCourses}
            />
          </Collapsible>
        </>
      )}
      <br />
    </div>
  );
};

export default GridViewConciseSubgroup;
