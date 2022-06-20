import React from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "antd";
import CourseButton from "./CourseButton";

const CourseBadge = ({ course }) => {
  const courseBadge = () => {
    if (course.unplanned) {
      return (
        <Badge
          key={course.key}
          count={(
            <Tooltip title="Course added but not planned">
              <div className="courseBadgeIcon">!</div>
            </Tooltip>
          )}
        >
          <CourseButton course={course} planned={false} />
        </Badge>
      );
    }

    if (course.past) {
      return <CourseButton course={course} planned />;
    }

    // for future courses planned
    // course.past can be undefined if not in term planner thus check for false
    if (course.past === false) {
      return (
        <Badge
          key={course.key}
          count={(
            <Tooltip title={`Future course planned for ${course.termPlanned}`}>
              <div className="courseBadgeIcon">
                <EyeOutlined />
              </div>
            </Tooltip>
          )}
        >
          <CourseButton course={course} planned />
        </Badge>
      );
    }

    // below is default badge for courses not in term planner
    return <CourseButton course={course} planned={false} />;
  };

  return courseBadge();
};

export default CourseBadge;
