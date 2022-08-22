import React from 'react';
import { Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import Collapsible from 'components/Collapsible';
import CoursesSection from '../GridView/CoursesSection';

const { Title } = Typography;

type Props = {
  courses: ViewSubgroupCourse[]
  // view: Views
};

const FreeElectivesSection = ({ courses }: Props) => {
  const uoc = courses.reduce(
    (sum, course) => (sum + ((course.UOC ?? 0)
      * getNumTerms((course.UOC ?? 0), course.isMultiterm))),
    0,
  );

  return (
    <Collapsible
      title={(
        <Title level={1} id="Free Electives" className="text">
          Free Electives
        </Title>
      )}
    >
      <Title level={4} className="text">You have {uoc} UOC worth of additional courses planned</Title>
      <div style={{ fontSize: '1rem' }}>
        These courses may or may not be counted to your program. Please manually verify your
        progression with this information.
      </div>
      <CoursesSection
        title="Additional Electives"
        plannedCourses={courses}
        unplannedCourses={[]}
      />
    </Collapsible>
  );
};

export default FreeElectivesSection;
