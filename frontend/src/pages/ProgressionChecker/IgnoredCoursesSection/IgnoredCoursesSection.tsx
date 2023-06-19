import React from 'react';
import { Table, Typography } from 'antd';
import { Views, ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import Collapsible from 'components/Collapsible';
import columnsData from '../columnsData';
import CoursesSection from '../GridView/CoursesSection';

const { Title } = Typography;

type Props = {
  courses: ViewSubgroupCourse[];
  view: Views;
};

const IgnoredCoursesSection = ({ courses, view }: Props) => {
  const uoc = courses.reduce(
    (sum, course) => sum + (course.UOC ?? 0) * getNumTerms(course.UOC ?? 0, course.isMultiterm),
    0
  );

  return (
    <Collapsible
      title={
        <Title level={1} id="Progression Ignored" className="text">
          Progression Ignored
        </Title>
      }
    >
      <Title level={4} className="text">
        You have {uoc} UOC worth of additional courses ignored from your progression
      </Title>
      <p>
        These courses have been manually ignored from the progression count. You can undo this from
        the Term Planner page if you wish.
      </p>
      {view === Views.TABLE ? (
        <Table
          dataSource={courses.map((c) => ({
            ...c,
            UOC: c.isMultiterm ? getNumTerms(c.UOC, c.isMultiterm) * c.UOC : c.UOC
          }))}
          columns={columnsData}
          pagination={false}
        />
      ) : (
        <CoursesSection title="Courses" plannedCourses={courses} unplannedCourses={[]} />
      )}
    </Collapsible>
  );
};

export default IgnoredCoursesSection;
