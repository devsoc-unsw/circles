import React from "react";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "antd";
import CourseButton from "components/CourseButton";
import S from "./styles";
import { purple } from "config/constants";

const UOCBadge = ({ uoc }) => {
  return (
    <S.UOCBadgeWrapper>
      <Badge
        style={{ backgroundColor: purple, color: "white", lineHeight: "1.5", height: "auto" }}
        size="small"
        count={`${uoc} UOC`}
      />
    </S.UOCBadgeWrapper>
  )
}

const CourseBadge = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/term-planner");
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
        <UOCBadge uoc={course.uoc} />
      </Badge>
    );
  }

  if (course.past) {
    return (
      <div style={{ position: "relative" }}>
        <CourseButton course={course} planned />
        <UOCBadge uoc={course.uoc} />
      </div>
    )
    // return 
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
        <UOCBadge uoc={course.uoc} />
      </Badge>
    );
  }

  // below is default badge for courses not in term planner
  return <CourseButton course={course} planned={false} />;
};

export default CourseBadge;
