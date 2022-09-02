import React, { useState } from 'react';
import { Button, Table, Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import columnsData from '../columnsData';
import CoursesModal from '../CoursesModal';
import S from './styles';

type Props = {
  subgroupTitle: string
  courses: ViewSubgroupCourse[]
  notes: string
  showNotes: boolean
  type: string
  uoc: number
};

const { Title } = Typography;

const TableView = ({
  subgroupTitle, courses, notes, showNotes, uoc, type,
}: Props) => {
  const plannedCourses = courses.filter((c) => c.plannedFor);
  const unplannedCourses = courses.filter((c) => !c.plannedFor);

  const [modalVisible, setModalVisible] = useState(false);

  const plannedUOC = courses
    .filter((course) => course.plannedFor)
    .reduce(
      (sum, course) => (sum + ((course.UOC ?? 0)
        * getNumTerms((course.UOC ?? 0), course.isMultiterm))),
      0,
    );

  return (
    <>
      <Title level={2} className="text">{subgroupTitle}</Title>
      {showNotes && <p>{notes}</p>}
      {type !== 'info_rule' && (
        <>
          <Title level={3} className="text">
            {uoc} UOC worth of courses ({Math.max(uoc - plannedUOC, 0)} UOC remaining)
          </Title>
          <Table
            dataSource={plannedCourses.map((c) => ({
              ...c,
              UOC: `${c.isMultiterm
                ? `${getNumTerms(c.UOC, c.isMultiterm)} × ${c.UOC}`
                : c.UOC} UOC`,
            }))}
            columns={columnsData}
            pagination={false}
          />
          <S.ViewCoursesButtonWrapper>
            <Button type="primary" onClick={() => setModalVisible(true)}>
              View Courses
            </Button>
            <CoursesModal
              title={subgroupTitle}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              courses={unplannedCourses}
            />
          </S.ViewCoursesButtonWrapper>
        </>
      )}
    </>
  );
};

export default TableView;
