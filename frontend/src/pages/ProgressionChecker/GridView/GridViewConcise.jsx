import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Skeleton, Typography } from "antd";
import Collapsible from "components/Collapsible";
import getFormattedPlannerCourses from "../getFormattedPlannerCourses";
import CourseBadge from "./CourseBadge";
import "./index.less";

/* eslint-disable */
const GridView = ({ isLoading, structure }) => {
  const { Title } = Typography;
  const [plannerCourses, setPlannerCourses] = useState({});
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
                // past and termPlanned will be undefined for courses not in planner
                past: plannerCourses[courseCode]?.past,
                termPlanned: plannerCourses[courseCode]?.termPlanned,
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
                  past: plannerCourses[courseCode].past,
                  termPlanned: plannerCourses[courseCode].termPlanned,
                  unplanned: !courseData.plannedFor,
                });
              }
            });
          }
        }
      });
      // if (structure[group].name) {
      //   // Append structure group name if exists
      //   const newGroup = `${group} - ${structure[group].name}`;
      //   newGridLayout[newGroup] = newGridLayout[group];
      //   delete newGridLayout[group];
      // }
    });
    setGridLayout(newGridLayout);
  };

  useEffect(() => {
    setPlannerCourses(getFormattedPlannerCourses(years, startYear, courses));

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
              <Title level={1}>{group} - {structure[group].name} - Concise </Title>
              {Object.entries(groupEntry).map(([subGroup, subGroupEntry]) => (
                <div key={subGroup} className="subCategory">
                  <Title level={2}>{subGroup}</Title>
                  <Title level={3}>
                    {structure[group][subGroup].UOC} UOC of the following courses
                  </Title>
                  <Collapsible title={<Title level={4}>Courses you have planned</Title>} headerStyle={{ border: "none" }}>
                    <div className="courseGroup">
                      {subGroupEntry.filter((c) => (
                        c.unplanned || c.past || c.past === false
                      )).map((course) => (
                        <CourseBadge course={course} />
                      ))}
                    </div>
                  </Collapsible>
                  <Collapsible title={<Title level={4}>Choose from the following</Title>} headerStyle={{ border: "none" }}>
                    <div className="courseGroup">
                      {subGroupEntry.filter((c) => (
                        !(c.unplanned || c.past || c.past === false)
                      )).map((course) => (
                        <CourseBadge course={course} />
                      ))}
                    </div>
                  </Collapsible>
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
