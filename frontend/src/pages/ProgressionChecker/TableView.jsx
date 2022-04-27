import React from "react";
import { Table } from "antd";

const TableView = ({ checkercourses }) => {
  const columns = [
    {
      title: "Course Name",
      dataIndex: "name",
      key: "name",
      render: (name) => name,
    },
    {
      title: "UOC",
      dataIndex: "UOC",
      key: "UOC",
    },
    {
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
    },
  ];

  return (
    <div className="listPage">
      <Table className="table-striped-rows" dataSource={checkercourses.corecourses} columns={columns} />
    </div>
  );
};

export default TableView;
