import React, { useState } from 'react';
import { Button, Table, Typography } from 'antd';
import CourseListModal from '../CourseListModal';
import S from './styles';
import { TableSubgroupCourse } from './types';

type Props = {
  subgroupTitle: string
  courses: TableSubgroupCourse[]
  uoc: number
};

const { Title } = Typography;

const TableSubgroup = ({ subgroupTitle, courses, uoc }: Props) => {
  const planned = courses.filter((c) => c.termPlanned);
  const unplanned = courses.filter((c) => !c.termPlanned);

  const [modalVisible, setModalVisible] = useState(false);

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'key',
      key: 'key',
      width: '15%',
    },
    {
      title: 'Course Name',
      dataIndex: 'title',
      key: 'title',
      width: '50%',
      ellipsis: true,
    },
    {
      title: 'UOC',
      dataIndex: 'UOC',
      key: 'UOC',
      width: '10%',
    },
    {
      title: 'Term Planned',
      dataIndex: 'termPlanned',
      key: 'termPlanned',
      width: '10%',
    },
  ];

  return (
    <>
      <Title level={2}>{subgroupTitle} ({uoc} UOC worth of courses)</Title>
      <Table
        dataSource={planned}
        columns={columns}
        pagination={false}
      />
      <S.ViewCoursesButtonWrapper>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          View Courses
        </Button>
        <CourseListModal
          title={subgroupTitle}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          courses={unplanned}
        />
      </S.ViewCoursesButtonWrapper>
    </>
  );
};

export default TableSubgroup;
