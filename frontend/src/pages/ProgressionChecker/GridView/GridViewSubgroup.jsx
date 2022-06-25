import React from "react";
import { Typography } from "antd";
import CourseBadge from "./CourseBadge";

const GridViewSubgroup = ({ uoc, subgroupKey, subgroupEntries }) => {
  const { Title } = Typography;

  return (
    <div key={subgroupKey} className="subCategory">
      <Title level={2}>{subgroupKey}</Title>
      <Title level={4}>
        {uoc} UOC of the following courses
      </Title>
      <div className="courseGroup">
        {subgroupEntries.map((course) => (
          <CourseBadge course={course} />
        ))}
      </div>
      <br />
    </div>
  );
};

export default GridViewSubgroup;
