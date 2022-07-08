import React from "react";
import { Empty, Typography } from "antd";
import CourseBadge from "./CourseBadge";
import GridModal from "./GridModal";
import S from "./styles";

const GridViewSubgroup = ({
  uoc,
  subgroupKey,
  subgroupEntries,
  hasLotsOfCourses,
}) => {
  const { Title } = Typography;

  const subgroup = subgroupEntries.map((course) => (
    <CourseBadge course={course} key={course.key} />
  ));

  const courseSection = () => {
    if (hasLotsOfCourses && subgroupEntries.length > 0) {
      return <GridModal title={subgroupKey} courses={subgroupEntries} />;
    }

    if (subgroupEntries.length > 0) {
      return subgroup;
    }

    return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  };

  return (
    <div key={subgroupKey}>
      <Title level={2}>{subgroupKey}</Title>
      <Title level={3}>{uoc} UOC worth of courses</Title>
      <S.CourseGroup>
        {courseSection()}
      </S.CourseGroup>
      <br />
    </div>
  );
};

export default GridViewSubgroup;
