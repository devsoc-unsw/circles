import React from "react";
import { Empty, Typography } from "antd";
import CourseBadge from "./CourseBadge";

const GridViewSubgroup = ({ uoc, subgroupKey, subgroupEntries }) => {
  const { Title } = Typography;

  const subgroup = subgroupEntries.map((course) => (
    <CourseBadge course={course} />
  ));

  return (
    <div key={subgroupKey} className="subCategory">
      <Title level={2}>{subgroupKey}</Title>
      <Title level={3}>
        {uoc} UOC of the following courses
      </Title>
      <div className="courseGroup">
        {subgroupEntries.length > 0 ? subgroup : <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </div>
      <br />
    </div>
  );
};

export default GridViewSubgroup;
