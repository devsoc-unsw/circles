import React from "react";
import { Table } from "antd";
import { getMostRecentPastTerm } from "../../TermPlanner/validateTermPlanner";
import "./index.less";

const TableView = ({ years, startYear, courses }) => {
  console.log(years);
  console.log(startYear);
  console.log(courses);
  const { Y: recentYear, T: recentTerm } = getMostRecentPastTerm(startYear);
  console.log(recentYear, recentTerm);

  // format data for table
  const pastCourses = [];
  years.slice(0, recentYear).forEach((year, yearIndex) => {
    Object.values(year).forEach((term, termIndex) => {
      Object.values(term).forEach((course) => {
        if (yearIndex < recentYear - 1 || termIndex <= recentTerm) {
          const currCourse = {};
          currCourse.key = course;
          currCourse.title = courses[course].title;
          currCourse.UOC = courses[course].UOC;
          const currYear = (startYear + yearIndex).toString().slice(-2);
          currCourse.termTaken = `${currYear}T${termIndex}`;
          pastCourses.push(currCourse);
        }
      });
    });
  });

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
    <div className="listPage">
      <Table className="table-striped-rows" dataSource={pastCourses} columns={columns} />
    </div>
  );
};

export default TableView;
