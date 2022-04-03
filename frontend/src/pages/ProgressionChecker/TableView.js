import React from "react";
import { Typography, Table } from 'antd';

const TableView = ({checkercourses}) => {

    const columns = [
        {
            title: 'Course Name',
            Index: 'name',
            key: 'name',
            render: name => {
                return <a>{name}</a>
            },
        },
        {
            title: 'UOC',
            Index: 'UOC',
            key: 'UOC',
        },
        {
            title: 'Faculty',
            Index: 'faculty',
            key: 'faculty',
            filters: [
                {
                    text: 'UNSW Business School',
                    value: 'UNSW Business School',
                },
                {
                    text: 'School of Computer Science and Engineering',
                    value: 'School of Computer Science and Engineering',
                }
            ],
            onFilter: (value, record) => record.faculty.indexOf(value) === 0,
        },
        {
            title: 'State',
            Index: 'state',
            key: 'state',
            sorter: (a,b) => a.state.localeCompare(b.state),
        },
        {
            title: 'Time',
            Index: 'time',
            key: 'time',
            sorter: (a,b) => a.time.localeCompare(b.time),
        },
    ];
    
    // console.log(checkercourses)
    return (
        <div className = "listPage">
            <Table className="table-striped-rows" Source={checkercourses.corecourses} columns={columns} />
        </div>
    );
};

export default TableView;

