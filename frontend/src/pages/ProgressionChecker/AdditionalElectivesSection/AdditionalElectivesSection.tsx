import React from 'react';
import { Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import Collapsible from 'components/Collapsible';
import CoursesSection from '../GridView/CoursesSection';

const { Title, Text } = Typography;

type Props = {
  courses: ViewSubgroupCourse[]
  // view: Views
};

const AdditionalElectivesSection = ({ courses }: Props) => {
  const uoc = courses.reduce(
    (sum, course) => (sum + ((course.UOC ?? 0)
      * getNumTerms((course.UOC ?? 0), course.isMultiterm))),
    0,
  );

  return (
    <Collapsible
      title={(
        <Title level={1} className="text">
          Additional Electives
        </Title>
      )}
    >
      <Title level={4} className="text">You have {uoc} UOC worth of additional courses planned</Title>
      <Text>
        These courses may be counted as free electives. Please manually verify your progression
        with this information.
      </Text>
      <CoursesSection
        title="Additional Electives"
        plannedCourses={courses}
        unplannedCourses={[]}
      />
    </Collapsible>
  );
};

export default AdditionalElectivesSection;
