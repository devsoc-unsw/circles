import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Empty, Skeleton, Typography } from "antd";
import Collapsible from "components/Collapsible";
import getFormattedPlannerCourses from "../getFormattedPlannerCourses";
import CourseBadge from "./CourseBadge";
import "./index.less";

/* eslint-disable max-len, comma-dangle */
const GridViewSubgroup = ({ uoc, subgroupKey, subgroupEntries }) => {
  const { Title } = Typography;

  const planned = subgroupEntries.filter((c) => (c.unplanned || c.past || c.past === false));
  const unplanned = subgroupEntries.filter((c) => (!(c.unplanned || c.past || c.past === false)));

  // convert lists to components
  const plannedGroup = (
    <div className="courseGroup">
      {planned.map((course) => (<CourseBadge course={course} key={course.key} />))}
    </div>
  );
  const unplannedGroup = (
    <div className="courseGroup">
      {unplanned.map((course) => (<CourseBadge course={course} key={course.key} />))}
    </div>
  );

  return (
    <div key={subgroupKey} className="subCategory">
      <Title level={2}>{subgroupKey}</Title>
      <Title level={3}>
        {uoc} UOC of the following courses
      </Title>
      <Collapsible
        title={<Title level={4}>Courses you have planned</Title>}
        headerStyle={{ border: "none" }}
        initiallyCollapsed={planned.length === 0}
      >
        {planned.length > 0 ? plannedGroup : <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </Collapsible>
      <Collapsible
        title={<Title level={4}>Choose from the following</Title>}
        headerStyle={{ border: "none" }}
        initiallyCollapsed={unplanned.length > 8 || unplanned.length === 0}
      >
        {unplanned.length > 0 ? unplannedGroup : <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </Collapsible>
      <br />
    </div>
  );
};

const GridView = ({ isLoading, structure }) => {
  const { Title } = Typography;
  const [gridLayout, setGridLayout] = useState({});
  const { years, startYear, courses } = useSelector((store) => store.planner);

  const generateGridStructure = (plannerCourses) => {
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
            });
            newGridLayout[group][subgroup].sort(
              (a, b) => a.key.localeCompare(b.key),
            );
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
    });

    return newGridLayout;
  };

  useEffect(() => {
    // generate the grid structure,
    // TODO: check if this should be in a useMemo or useCallback instead?
    const plannerCourses = getFormattedPlannerCourses(years, startYear, courses);
    const gridStructure = generateGridStructure(plannerCourses);
    setGridLayout(gridStructure);
  }, [isLoading, structure, years, startYear, courses]);

  return (
    <div className="gridViewContainer">
      {(isLoading || Object.keys(gridLayout).length === 0) ? (
        <Skeleton />
      ) : (
        <>
          {Object.entries(gridLayout).map(([group, groupEntry]) => (
            <div key={group} className="category">
              <Title level={1}>{group} - {structure[group].name}</Title>
              {Object.entries(groupEntry).map(
                ([subgroup, subgroupEntry]) => (
                  <GridViewSubgroup
                    uoc={structure[group][subgroup].UOC}
                    subgroupKey={subgroup}
                    subgroupEntries={subgroupEntry}
                  />
                )
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default GridView;
