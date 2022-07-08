import React from "react";
import { Empty, Typography } from "antd";
import Collapsible from "components/Collapsible";
import CourseBadge from "./CourseBadge";
import GridModal from "./GridModal";
import S from "./styles";

const GridViewConciseSubgroup = ({
  uoc,
  subgroupKey,
  subgroupEntries,
  hasLotsOfCourses,
}) => {
  const { Title } = Typography;
  const plannedState = {
    PLANNED: "planned",
    UNPLANNED: "unplanned",
  };

  const planned = subgroupEntries.filter((c) => (c.unplanned || c.past || c.past === false));
  const unplanned = subgroupEntries.filter((c) => (!(c.unplanned || c.past || c.past === false)));

  // convert lists to components
  const plannedGroup = (
    <S.CourseGroup>
      {planned.map((course) => (<CourseBadge course={course} key={course.key} />))}
    </S.CourseGroup>
  );
  const unplannedGroup = (
    <S.CourseGroup>
      {unplanned.map((course) => (<CourseBadge course={course} key={course.key} />))}
    </S.CourseGroup>
  );

  const collapsibleSection = (planState) => {
    if (hasLotsOfCourses && planState === plannedState.UNPLANNED && planned.length > 0) {
      return <GridModal title={subgroupKey} courses={unplanned} />;
    }

    if (planState === plannedState.PLANNED && planned.length > 0) {
      return plannedGroup;
    }

    if (planState === plannedState.UNPLANNED && unplanned.length > 0) {
      return unplannedGroup;
    }

    return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  };

  return (
    <div key={subgroupKey}>
      <Title level={2}>{subgroupKey}</Title>
      <Title level={3}>{uoc} UOC worth of courses</Title>
      {!!subgroupEntries.length && (
        <>
          <Collapsible
            title={<Title level={4}>Courses in your planner</Title>}
            headerStyle={{ border: "none" }}
            initiallyCollapsed={!planned.length}
          >
            {collapsibleSection(plannedState.PLANNED)}
          </Collapsible>
          <Collapsible
            title={<Title level={4}>Choose the following courses</Title>}
            headerStyle={{ border: "none" }}
            initiallyCollapsed={!hasLotsOfCourses && (unplanned.length > 16 || !unplanned.length)}
          >
            {collapsibleSection(plannedState.UNPLANNED)}
          </Collapsible>
        </>
      )}
      <br />
    </div>
  );
};

export default GridViewConciseSubgroup;
