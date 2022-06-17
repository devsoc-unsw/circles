import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import { addTab } from "reducers/courseTabsSlice";
import getFormattedPlannerCourses from "../getFormattedPlannerCourses";
import "./index.less";

const GridView = ({ isLoading, structure }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
                planned: courseCode in plannerCourses,
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
                  planned: courseCode in plannerCourses,
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

  const handleCourseLink = (courseCode) => {
    navigate("/course-selector");
    dispatch(addTab(courseCode));
  };

  const courseBadge = (course) => {
    if (course.unplanned) {
      return (
        <Badge
          count={(
            <Tooltip title="Course added but not planned">
              <div className="courseBadgeIcon">!</div>
            </Tooltip>
          )}
        >
          <Button
            className="checkerButton"
            type="primary"
            style={{ background: "#FFF", color: "#9254de" }}
            key={course.key}
            onClick={() => handleCourseLink(course.key)}
          >
            {course.key}: {course.title}
          </Button>
        </Badge>
      );
    }

    if (course.past) {
      return (
        <Button
          className="checkerButton"
          type="primary"
          key={course.key}
          onClick={() => handleCourseLink(course.key)}
        >
          {course.key}: {course.title}
        </Button>
      );
    }

    // for future courses planned
    // course.past can be undefined if not in term planner thus check for false
    if (course.past === false) {
      const tooltip = `Future course planned for ${course.termPlanned}`;
      return (
        <Badge
          count={(
            <Tooltip title={tooltip}>
              <div className="courseBadgeIcon">
                <EyeOutlined />
              </div>
            </Tooltip>
          )}
        >
          <Button
            className="checkerButton"
            type="primary"
            key={course.key}
            onClick={() => handleCourseLink(course.key)}
          >
            {course.key}: {course.title}
          </Button>
        </Badge>
      );
    }

    // below is default badge for courses not in term planner
    return (
      <Button
        className="checkerButton"
        type="primary"
        style={{ background: "#FFF", color: "#9254de" }}
        key={course.key}
        onClick={() => handleCourseLink(course.key)}
      >
        {course.key}: {course.title}
      </Button>
    );
  };

  return (
    <div className="gridViewContainer">
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {Object.entries(gridLayout).map(([group, groupEntry]) => (
            <div key={group} className="category">
              <Title level={1}>{group} - {structure[group].name} </Title>
              {Object.entries(groupEntry).map(([subGroup, subGroupEntry]) => (
                <div key={subGroup} className="subCategory">
                  <Title level={2}>{subGroup}</Title>
                  <Title level={4}>
                    {structure[group][subGroup].UOC} UOC of the following courses
                  </Title>
                  <div className="courseGroup">
                    {subGroupEntry.map((course) => (
                      courseBadge(course)
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
