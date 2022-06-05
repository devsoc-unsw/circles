<<<<<<< HEAD
<<<<<<< HEAD
import React from "react";
import { Table } from "antd";
import "./index.less";

const TableView = ({ checkercourses }) => {
  const columns = [
    {
      title: "Course Name",
      dataIndex: "name",
      key: "name",
      render: (name) => name,
=======
import React, { useState, useEffect } from "react";
import { Typography, Table, Skeleton } from "antd";
=======
import React, { useEffect, useState } from "react";
>>>>>>> dev
import { useSelector } from "react-redux";
import { Skeleton, Table, Typography } from "antd";
import getPastCourses from "../getPastCourses";
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
    setPastCourses(getPastCourses(years, startYear, courses));
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
>>>>>>> dev
    },
    {
      title: "UOC",
      dataIndex: "UOC",
      key: "UOC",
    },
    {
<<<<<<< HEAD
      title: "Faculty",
      dataIndex: "faculty",
      key: "faculty",
      filters: [
        {
          text: "UNSW Business School",
          value: "UNSW Business School",
        },
        {
          text: "School of Computer Science and Engineering",
          value: "School of Computer Science and Engineering",
        },
      ],
      onFilter: (value, record) => record.faculty.indexOf(value) === 0,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => a.state.localeCompare(b.state),
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      sorter: (a, b) => a.time.localeCompare(b.time),
=======
      title: "Term Taken",
      dataIndex: "termTaken",
      key: "termTaken",
>>>>>>> dev
    },
  ];

  return (
<<<<<<< HEAD
    <div className="listPage">
      <Table className="table-striped-rows" dataSource={checkercourses.corecourses} columns={columns} />
=======
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
>>>>>>> dev
    </div>
  );
};

export default TableView;
