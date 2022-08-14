import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Skeleton, Typography } from 'antd';
import { TableStructure } from 'types/progressionViews';
import { ProgramStructure } from 'types/structure';
import getFormattedPlannerCourses, { FormattedPlannerCourse } from 'utils/getFormattedPlannerCourses';
import Collapsible from 'components/Collapsible';
import type { RootState } from 'config/store';
import TableSubgroup from './TableSubgroup';

type Props = {
  isLoading: boolean
  structure: ProgramStructure
};

const TableView = ({ isLoading, structure }: Props) => {
  const { Title } = Typography;
  const [tableLayout, setTableLayout] = useState<TableStructure>({});
  const { years, startYear, courses } = useSelector((store: RootState) => store.planner);

  useEffect(() => {
    const generateTableStructure = (plannedCourses: Record<string, FormattedPlannerCourse>) => {
      const newTableLayout: TableStructure = {};

      // Example groups: Major, Minor, General, Rules
      Object.keys(structure).forEach((group) => {
        newTableLayout[group] = {};
        // Example subgroup: Core Courses, Computing Electives
        Object.keys(structure[group].content).forEach((subgroup) => {
          const subgroupStructure = structure[group].content[subgroup];

          newTableLayout[group][subgroup] = [];

          // only consider disciplinary component courses
          Object.keys(subgroupStructure.courses).forEach((courseCode) => {
            newTableLayout[group][subgroup].push({
              key: courseCode,
              title: subgroupStructure.courses[courseCode],
              UOC: courses[courseCode]?.UOC,
              termPlanned: plannedCourses[courseCode]?.termPlanned,
              unplanned: courses[courseCode]?.plannedFor === null,
            });
          });
        });
      });

      return newTableLayout;
    };

    const plannerCourses = getFormattedPlannerCourses(years, startYear, courses);
    const tableStructure = generateTableStructure(plannerCourses);
    setTableLayout(tableStructure);
  }, [isLoading, structure, years, startYear, courses]);

  return (
    <div>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {Object.entries(tableLayout).map(([group, groupEntry]) => (
            <Collapsible
              title={(
                <Title level={1} className="text" id={group}>
                  {structure[group].name ? `${group} - ${structure[group].name}` : group}
                </Title>
              )}
              key={group}
              initiallyCollapsed={group === 'Rules'}
            >
              {Object.entries(groupEntry).map(([subgroup, subgroupCourses]) => (
                <TableSubgroup
                  subgroupTitle={subgroup}
                  courses={subgroupCourses}
                  uoc={structure[group].content[subgroup].UOC}
                />
              ))}
            </Collapsible>
          ))}
        </>
      )}
    </div>
  );
};

export default TableView;
