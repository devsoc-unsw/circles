import React from "react";
import { Typography, Skeleton } from "antd";
import CourseComponents from "./CourseComponents";

const ListView = ({ isLoading, degree, progressioncourses }) => {
  const { Title } = Typography;

  return (
    isLoading ? (
      <Skeleton />
    ) : (
      <div>
        {degree.concentrations
            && degree.concentrations.map((concentration) => (
              <div
                className="listPage"
                id={concentration.name}
                key={concentration.name}
              >
                <Title className="text">{concentration.type.charAt(0).toUpperCase() + concentration.type.slice(1)} ({concentration.name})</Title>
                <CourseComponents
                  progressioncourses={progressioncourses}
                  type={concentration.type}
                />
              </div>
            ))}
      </div>
    )
  );
};

export default ListView;
