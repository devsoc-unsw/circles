import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Skeleton, Typography } from "antd";
import getFormattedPlannerCourses from "../getFormattedPlannerCourses";
import GridViewConciseSubgroup from "./GridViewConciseSubgroup";
import GridViewSubgroup from "./GridViewSubgroup";
import S from "./styles";

const GridView = ({ isLoading, structure, concise }) => {
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
          newGridLayout[group][subgroup] = {
            // section types with gened or rule substring can have their courses hidden as a modal
            hasLotsOfCourses: subgroupStructure?.type.includes("gened") || subgroupStructure?.type.includes("rule"),
            courses: [],
          };

          if (subgroupStructure.courses) {
            // only consider disciplinary component courses
            Object.keys(subgroupStructure.courses).forEach((courseCode) => {
              newGridLayout[group][subgroup].courses.push({
                key: courseCode,
                title: subgroupStructure.courses[courseCode],
                // past and termPlanned will be undefined for courses not in planner
                past: plannerCourses[courseCode]?.past,
                termPlanned: plannerCourses[courseCode]?.termPlanned,
                // must check null as could be undefined
                unplanned: courses[courseCode]?.plannedFor === null,
              });
            });
            newGridLayout[group][subgroup].courses.sort(
              (a, b) => a.key.localeCompare(b.key),
            );
          } else {
            // If there is no specified course list for the subgroup, then manually
            // show the added courses.
            Object.keys(courses).forEach((courseCode) => {
              const courseData = courses[courseCode];
              if (courseData && courseData.type === subgroup) {
                newGridLayout[group][subgroup].courses.push({
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
    <S.GridViewContainer>
      {(isLoading || Object.keys(gridLayout).length === 0) ? (
        <Skeleton />
      ) : (
        <>
          {Object.entries(gridLayout).map(([group, groupEntry]) => (
            <div key={group} className="category">
              <Title level={1}>{group} - {structure[group].name}</Title>
              {Object.entries(groupEntry).map(
                ([subgroup, subgroupEntry]) => (
                  (concise === true) ? (
                    <GridViewConciseSubgroup
                      uoc={structure[group][subgroup].UOC}
                      subgroupKey={subgroup}
                      subgroupEntries={subgroupEntry.courses}
                      hasLotsOfCourses={subgroupEntry.hasLotsOfCourses}
                    />
                  ) : (
                    <GridViewSubgroup
                      uoc={structure[group][subgroup].UOC}
                      subgroupKey={subgroup}
                      subgroupEntries={subgroupEntry.courses}
                      hasLotsOfCourses={subgroupEntry.hasLotsOfCourses}
                    />
                  )
                ),
              )}
            </div>
          ))}
        </>
      )}
    </S.GridViewContainer>
  );
};

export default GridView;
