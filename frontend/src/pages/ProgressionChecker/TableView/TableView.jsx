import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Skeleton, Table, Typography } from "antd";
import getFormattedPlannerCourses from "../getFormattedPlannerCourses";
import "./index.less";

const TableView = ({ isLoading, structure }) => {
  const { Title } = Typography;
  const [pastCourses, setPastCourses] = useState({});
  const [tableLayout, setTableLayout] = useState({});
  const { years, startYear, courses } = useSelector((store) => store.planner);

  const generateTableStructure = (plannedCourses) => {
    const newTableLayout = {};

    // Example groups: Major, Minor, General
    Object.keys(structure).forEach((group) => {
      newTableLayout[group] = {};
      // Example subgroup: Core Courses, Computing Electives, Flexible Education
      Object.keys(structure[group]).forEach((subgroup) => {
        if (typeof structure[group][subgroup] !== "string") {
          // case where structure[group][subgroup] gives information on courses in an object
          const subgroupStructure = structure[group][subgroup];
          newTableLayout[group][subgroup] = [];

          if (subgroupStructure.courses) {
            // only consider disciplinary component courses
            Object.keys(subgroupStructure.courses).forEach((courseCode) => {
              if (courseCode in plannedCourses) {
                newTableLayout[group][subgroup].push({
                  key: courseCode,
                  title: plannedCourses[courseCode].title,
                  UOC: plannedCourses[courseCode].UOC,
                  termTaken: plannedCourses[courseCode].termTaken,
                });
                newTableLayout[group][subgroup].sort(
                  (a, b) => a.termTaken.localeCompare(b.termTaken),
                );
              }
            });
          } else {
            // If there is no specified course list for the subgroup, then manually
            // show the added courses.
            Object.keys(plannedCourses).forEach((courseCode) => {
              const courseData = plannedCourses[courseCode];
              if (courseData && courseData.type === subgroup) {
                newTableLayout[group][subgroup].push({
                  key: courseCode,
                  title: plannedCourses.courseCode.title,
                  UOC: plannedCourses.courseCode.UOC,
                  termTaken: plannedCourses.courseCode.termTaken,
                });
              }
            });
          }
        }
      });
      if (structure[group].name) {
        // Append structure group name if exists
        const newGroup = `${group} - ${structure[group].name}`;
        newTableLayout[newGroup] = newTableLayout[group];
        delete newTableLayout[group];
      }
    });
    setTableLayout(newTableLayout);
  };

  useEffect(() => {
    setPastCourses(getFormattedPlannerCourses(years, startYear, courses));
    generateTableStructure(pastCourses);
  }, [isLoading, structure, years, startYear, courses]);

  const columns = [
    {
      title: "Course Code",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Course Name",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "UOC",
      dataIndex: "UOC",
      key: "UOC",
    },
    {
      title: "Term Taken",
      dataIndex: "termTaken",
      key: "termTaken",
    },
  ];

  return (
    <div className="tableViewContainer">
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {Object.entries(tableLayout).map(([group, groupEntry]) => (
            <div key={group} className="category">
              <Title level={1}>{group}</Title>
              {Object.entries(groupEntry).map(([subGroup, subGroupEntry]) => (
                <div key={subGroup} className="subCategory">
                  <Title level={2}>{subGroup}</Title>
                  <Table
                    className="table-striped-rows"
                    dataSource={subGroupEntry}
                    columns={columns}
                    pagination={{ position: ["none", "none"] }}
                  />
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

export default TableView;
