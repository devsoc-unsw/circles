import React, { useState } from "react";
import { Button, Empty, Typography } from "antd";
import Collapsible from "components/Collapsible";
import CourseListModal from "../../../components/CourseListModal";
import CourseBadge from "../CourseBadge";
import S from "./styles";

type Props = {
  uoc: number
  subgroupKey: string
  subgroupEntries: any
  hasLotsOfCourses: any
};

const GridViewConciseSubgroup = ({
  uoc,
  subgroupKey,
  subgroupEntries,
  hasLotsOfCourses,
}: Props) => {
  const { Title } = Typography;
  const plannedState = {
    PLANNED: "planned",
    UNPLANNED: "unplanned",
  };

  const planned = subgroupEntries.filter((c) => (c.unplanned || c.past || c.past === false));
  const plannedUOC = planned.reduce((sum, course) => (sum + (course.uoc ?? 0)), 0);
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
    const [modalVisible, setModalVisible] = useState(false);
    if (hasLotsOfCourses && planState === plannedState.UNPLANNED) {
      return (
        <S.ViewAllCoursesWrapper>
          <Button type="primary" onClick={() => setModalVisible(true)}>
            View All Courses
          </Button>
          <CourseListModal
            title={subgroupKey}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            courses={unplanned}
          />
        </S.ViewAllCoursesWrapper>
      );
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
      <Title level={2} className="text">{subgroupKey}</Title>
      <Title level={3} className="text">{uoc} UOC of the following courses</Title>
      {!!subgroupEntries.length && (
        <>
          <Collapsible
            title={<Title level={4} className="text">You have {plannedUOC} UOC worth of courses planned</Title>}
            headerStyle={{ border: "none" }}
            initiallyCollapsed={!planned.length}
          >
            {collapsibleSection(plannedState.PLANNED)}
          </Collapsible>
          <Collapsible
            title={<Title level={4} className="text">Choose {Math.max(uoc - plannedUOC, 0)} UOC from the following courses</Title>}
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
