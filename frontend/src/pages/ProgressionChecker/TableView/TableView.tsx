import React, { useState } from 'react';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import Typography from 'antd/lib/typography';
import { ViewSubgroupCourse } from 'types/progressionViews';
import CourseListModal from '../CoursesModal';
import S from './styles';

type Props = {
  subgroupTitle: string
  courses: ViewSubgroupCourse[]
  uoc: number
};

const { Title } = Typography;

const TableView = ({ subgroupTitle, courses, uoc }: Props) => {
  const planned = courses.filter((c) => c.plannedFor);
  const unplanned = courses.filter((c) => !c.plannedFor);

  const [modalVisible, setModalVisible] = useState(false);

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
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
      dataIndex: 'plannedFor',
      key: 'plannedFor',
      width: '10%',
    },
  ];

  return (
    <>
      <Title level={2}>{subgroupTitle}</Title>
      <Title level={3}>{uoc} UOC worth of courses</Title>
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

export default TableView;
