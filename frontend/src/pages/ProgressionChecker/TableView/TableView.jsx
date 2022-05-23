import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { getMostRecentPastTerm } from "../../TermPlanner/validateTermPlanner";
import "./index.less";

const TableView = ({ structure }) => {
  const [pastCourses, setPastCourses] = useState({});
  const [tableLayout, setTableLayout] = useState({});
  const { years, startYear, courses } = useSelector((store) => store.planner);

  const getPastCourses = () => {
    const { Y: recentYear, T: recentTerm } = getMostRecentPastTerm(startYear);
    const newPastCourses = {};

    years.slice(0, recentYear).forEach((year, yearIndex) => {
      Object.values(year).forEach((term, termIndex) => {
        Object.values(term).forEach((course) => {
          if (yearIndex < recentYear - 1 || termIndex <= recentTerm) {
            const currCourse = {};
            currCourse.title = courses[course].title;
            currCourse.UOC = courses[course].UOC;
            currCourse.type = courses[course].type;
            const currYear = (startYear + yearIndex).toString().slice(-2);
            currCourse.termTaken = `${currYear}T${termIndex}`;

            newPastCourses[course] = currCourse;
          }
        });
      });
    });
    setPastCourses(newPastCourses);
  };

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
            // show the added courses for the subgroup.
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
    getPastCourses();
    generateTableStructure(pastCourses);
  }, [structure, years, startYear, courses]);

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
      {Object.entries(tableLayout).map(([group, groupEntry]) => (
        <div key={group} className="category">
          <h1>{group}</h1>
          {Object.entries(groupEntry).map(([subGroup, subGroupEntry]) => (
            <div key={subGroup} className="subCategory">
              <h2>{subGroup}</h2>
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
    </div>
  );
};

export default TableView;
