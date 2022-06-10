import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Badge,
  Button,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import getPastCourses from "../getPastCourses";
import "./index.less";

const GridView = ({ isLoading, structure }) => {
  const { Title } = Typography;
  const [pastCourses, setPastCourses] = useState({});
  const [gridLayout, setGridLayout] = useState({});
  const { years, startYear, courses } = useSelector((store) => store.planner);

  const generateGridStructure = () => {
    const newGridLayout = {};

    // Example groups: Major, Minor, General
    Object.keys(structure).forEach((group) => {
      newGridLayout[group] = {};
      // Example subgroup: Core Courses, Computing Electives, Flexible Education
      Object.keys(structure[group]).forEach((subgroup) => {
        if (typeof structure[group][subgroup] !== "string") {
          // case where structure[group][subgroup] gives information on courses in an object
          const subgroupStructure = structure[group][subgroup];
          newGridLayout[group][subgroup] = [];

          if (subgroupStructure.courses) {
            // only consider disciplinary component courses
            Object.keys(subgroupStructure.courses).forEach((courseCode) => {
              newGridLayout[group][subgroup].push({
                key: courseCode,
                title: subgroupStructure.courses[courseCode],
                completed: courseCode in pastCourses,
                // must check null as could be undefined
                unplanned: courses[courseCode]?.plannedFor === null,
              });
              newGridLayout[group][subgroup].sort(
                (a, b) => a.key.localeCompare(b.key),
              );
            });
          } else {
            // If there is no specified course list for the subgroup, then manually
            // show the added courses.
            Object.keys(courses).forEach((courseCode) => {
              const courseData = courses[courseCode];
              if (courseData && courseData.type === subgroup) {
                newGridLayout[group][subgroup].push({
                  key: courseCode,
                  title: courseData.title,
                  completed: courseCode in pastCourses,
                  unplanned: !courseData.plannedFor,
                });
              }
            });
          }
        }
      });
      if (structure[group].name) {
        // Append structure group name if exists
        const newGroup = `${group} - ${structure[group].name}`;
        newGridLayout[newGroup] = newGridLayout[group];
        delete newGridLayout[group];
      }
    });
    setGridLayout(newGridLayout);
  };

  useEffect(() => {
    setPastCourses(getPastCourses(years, startYear, courses));
    generateGridStructure();
  }, [isLoading, structure, years, startYear, courses]);

  return (
    <div className="gridViewContainer">
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {Object.entries(gridLayout).map(([group, groupEntry]) => (
            <div key={group} className="category">
              <Title level={1}>{group}</Title>
              {Object.entries(groupEntry).map(([subGroup, subGroupEntry]) => (
                <div key={subGroup} className="subCategory">
                  <Title level={2}>{subGroup}</Title>
                  <div className="courseGroup">
                    {subGroupEntry.map((course) => (
                      course.unplanned ? (
                        <Badge
                          count={(
                            <Tooltip title="Course added but not planned">
                              <div className="unplannedBadge">
                                !
                              </div>
                            </Tooltip>
                          )}
                        >
                          <Button className="checkerButton" type="primary" style={course.completed ? null : { background: "#FFF", color: "#9254de" }} key={course.key}>
                            {course.key}: {course.title}
                          </Button>
                        </Badge>
                      ) : (
                        <Button className="checkerButton" type="primary" style={course.completed ? null : { background: "#FFF", color: "#9254de" }} key={course.key}>
                          {course.key}: {course.title}
                        </Button>
                      )
                    ))}
                  </div>
                  <br />
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default GridView;
