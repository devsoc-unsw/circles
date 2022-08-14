import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Skeleton, Typography } from 'antd';
import { ProgramStructure } from 'types/structure';
import getFormattedPlannerCourses, { FormattedPlannerCourse } from 'utils/getFormattedPlannerCourses';
import Collapsible from 'components/Collapsible';
import type { RootState } from 'config/store';
import GridViewConciseSubgroup from './GridViewConciseSubgroup';
import GridViewSubgroup from './GridViewSubgroup';
import S from './styles';
import { GridStructure, GridSubgroup } from './types';

type Props = {
  isLoading: boolean
  structure: ProgramStructure
  concise: boolean
};

const GridView = ({ isLoading, structure, concise }: Props) => {
  const { Title } = Typography;
  const [gridLayout, setGridLayout] = useState<GridStructure>({});
  const { years, startYear, courses } = useSelector((store: RootState) => store.planner);

  useEffect(() => {
    const generateGridStructure = (plannerCourses: Record<string, FormattedPlannerCourse>) => {
      const newGridLayout: GridStructure = {};

      // Example groups: Major, Minor, General, Rules
      Object.keys(structure).forEach((group) => {
        newGridLayout[group] = {};

        // Example subgroup: Core Courses, Computing Electives
        Object.keys(structure[group].content).forEach((subgroup) => {
          const subgroupStructure = structure[group].content[subgroup];

          newGridLayout[group][subgroup] = {
            // section types with gened or rule/elective substring can have their
            // courses hidden as a modal
            hasLotsOfCourses: subgroupStructure.type.includes('gened')
              || subgroupStructure.type.includes('rule')
              || subgroupStructure.type.includes('electives'),
            courses: [],
          };

          // only consider disciplinary component courses
          Object.keys(subgroupStructure.courses).forEach((courseCode) => {
            newGridLayout[group][subgroup].courses.push({
              key: courseCode,
              title: subgroupStructure.courses[courseCode],
              // past and termPlanned will be undefined for courses not in planner
              past: plannerCourses[courseCode]?.past,
              termPlanned: plannerCourses[courseCode]?.termPlanned,
              uoc: courses[courseCode]?.UOC,
              // must check null as could be undefined
              unplanned: courses[courseCode]?.plannedFor === null,
            });
          });

          newGridLayout[group][subgroup].courses.sort(
            (a, b) => a.key.localeCompare(b.key),
          );
        });
      });

      return newGridLayout;
    };

    // generate the grid structure,
    // TODO: check if this should be in a useMemo or useCallback instead?
    const plannerCourses = getFormattedPlannerCourses(years, startYear, courses);
    const gridStructure = generateGridStructure(plannerCourses);
    setGridLayout(gridStructure);
  }, [isLoading, structure, years, startYear, courses]);

  const sortSubgroups = (item1: [string, GridSubgroup], item2: [string, GridSubgroup]) => {
    if (/Core/.test(item1[0]) && !/Core/.test(item2[0])) {
      return -1;
    }

    if (/Core/.test(item2[0]) && !/Core/.test(item1[0])) {
      return 1;
    }

    return item1[0] > item2[0] ? 1 : -1;
  };

  return (
    <S.GridViewContainer>
      {(isLoading || Object.keys(gridLayout).length === 0) ? (
        // TODO add skeleton
        <Skeleton />
      ) : (
        <>
          {Object.entries(gridLayout).map(([group, groupEntry]) => (
            <Collapsible
              title={(
                <Title level={1} className="text" id={group}>
                  {structure[group].name ? `${group} - ${structure[group].name}` : group}
                </Title>
              )}
              key={group}
              initiallyCollapsed={group === 'Rules'}
            >
              {Object.entries(groupEntry).sort(sortSubgroups).map(
                ([subgroup, subgroupEntry]) => (
                  (concise === true) ? (
                    <GridViewConciseSubgroup
                      uoc={structure[group].content[subgroup].UOC}
                      subgroupKey={subgroup}
                      subgroupEntries={subgroupEntry.courses}
                      hasLotsOfCourses={subgroupEntry.hasLotsOfCourses}
                    />
                  ) : (
                    <GridViewSubgroup
                      uoc={structure[group].content[subgroup].UOC}
                      subgroupKey={subgroup}
                      subgroupEntries={subgroupEntry.courses}
                      hasLotsOfCourses={subgroupEntry.hasLotsOfCourses}
                    />
                  )
                ),
              )}
            </Collapsible>
          ))}
        </>
      )}
    </S.GridViewContainer>
  );
};

export default GridView;
