import React from "react";
import { Empty, Typography } from "antd";
import CourseBadge from "./CourseBadge";
import GridModal from "./GridModal";

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
    <div key={subgroupKey} className="subCategory">
      <Title level={2}>{subgroupKey}</Title>
      <Title level={3}>
        {uoc} UOC of the following courses
      </Title>
      <div className="courseGroup">
        {courseSection()}
      </div>
      <br />
    </div>
  );
};

export default GridViewSubgroup;
