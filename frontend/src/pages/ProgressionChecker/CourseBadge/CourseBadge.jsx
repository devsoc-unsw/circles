import React from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";
import CourseButton from "components/CourseButton";
import S from "./styles";

const CourseBadge = ({ course }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/term-planner");
  };

  if (course.unplanned) {
    return (
      <Badge
        key={course.key}
        count={(
          <Tooltip title="Course added but not planned">
            <S.CourseBadgeIcon>!</S.CourseBadgeIcon>
          </Tooltip>
          )}
        onClick={handleClick}
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
            <S.CourseBadgeIcon>
              <EyeOutlined />
            </S.CourseBadgeIcon>
          </Tooltip>
        )}
        onClick={handleClick}
      >
        <CourseButton course={course} planned />
      </Badge>
    );
  }

  // below is default badge for courses not in term planner
  return <CourseButton course={course} planned={false} />;
};

export default CourseBadge;
