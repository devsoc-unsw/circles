import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BorderlessTableOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Divider, Typography } from 'antd';
import axios from 'axios';
import { Structure } from 'types/api';
import { ProgressionViewStructure, Views, ViewSubgroup } from 'types/progressionViews';
import { ProgramStructure } from 'types/structure';
import openNotification from 'utils/openNotification';
import Collapsible from 'components/Collapsible';
import PageTemplate from 'components/PageTemplate';
import { inDev, MAX_COURSES_OVERFLOW } from 'config/constants';
import type { RootState } from 'config/store';
import Dashboard from './Dashboard';
import GridView from './GridView';
import S from './styles';
import TableView from './TableView';

type Props = {
  structure: ProgramStructure
};

const { Title } = Typography;

const ProgressionCheckerCourses = ({ structure }: Props) => {
  const [view, setView] = useState(Views.GRID_CONCISE);

  const { courses, unplanned } = useSelector((store: RootState) => store.planner);

  const countedCourses: string[] = [];

  const generateViewStructure = () => {
    const newViewLayout: ProgressionViewStructure = {};

    // Example groups: Major, Minor, General, Rules
    Object.keys(structure).forEach((group) => {
      newViewLayout[group] = {};

      // Example subgroup: Core Courses, Computing Electives
      Object.keys(structure[group].content).forEach((subgroup) => {
        const subgroupStructure = structure[group].content[subgroup];

        newViewLayout[group][subgroup] = {
          // section types with gened or rule/elective substring can have their
          // courses hidden as a modal
          isCoursesOverflow: subgroupStructure.type.includes('gened')
            || subgroupStructure.type.includes('rule')
            || subgroupStructure.type.includes('electives')
            || Object.keys(subgroupStructure.courses).length > MAX_COURSES_OVERFLOW,
          courses: [],
        };

        // only consider disciplinary component courses
        Object.keys(subgroupStructure.courses).forEach((courseCode) => {
          newViewLayout[group][subgroup].courses.push({
            courseCode,
            title: subgroupStructure.courses[courseCode],
            UOC: courses[courseCode]?.UOC || 0,
            plannedFor: courses[courseCode]?.plannedFor || '',
            isUnplanned: unplanned.includes(courseCode),
            isMultiterm: !!courses[courseCode]?.isMultiterm,
            isDoubleCounted: countedCourses.includes(courseCode) && !/Core/.test(subgroup) && !group.includes('Rules'),
          });
          if (courses[courseCode]?.plannedFor && !countedCourses.includes(courseCode)) {
            countedCourses.push(courseCode);
          }
        });

        newViewLayout[group][subgroup].courses.sort(
          (a, b) => a.courseCode.localeCompare(b.courseCode),
        );
      });
    });
    return newViewLayout;
  };

  const viewStructure = generateViewStructure();

  const sortSubgroups = (item1: [string, ViewSubgroup], item2: [string, ViewSubgroup]) => {
    if (/Core/.test(item1[0]) && !/Core/.test(item2[0])) {
      return -1;
    }

    if (/Core/.test(item2[0]) && !/Core/.test(item1[0])) {
      return 1;
    }

    return item1[0] > item2[0] ? 1 : -1;
  };

  return (
    <S.ProgressionViewContainer>
      <S.ViewSwitcherWrapper>
        {
          view === Views.GRID || view === Views.GRID_CONCISE
            ? (
              <>
                <Button
                  type="primary"
                  icon={view === Views.GRID ? <EyeInvisibleOutlined /> : <EyeFilled />}
                  onClick={() => setView(view === Views.GRID ? Views.GRID_CONCISE : Views.GRID)}
                >
                  {view === Views.GRID ? 'Display Concise Mode' : 'Display Full Mode'}
                </Button>
                {inDev && (
                  <Button
                    type="primary"
                    icon={<TableOutlined />}
                    onClick={() => setView(Views.TABLE)}
                  >
                    Display Table View
                  </Button>
                )}
              </>
            )
            : (
              <Button
                type="primary"
                icon={<BorderlessTableOutlined />}
                onClick={() => setView(Views.GRID)}
              >
                Display Grid View
              </Button>
            )
        }
      </S.ViewSwitcherWrapper>
      {Object.entries(viewStructure).map(([group, groupEntry]) => (
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
            ([subgroup, subgroupEntry]) => {
              if (view === Views.TABLE) {
                return (
                  <TableView
                    uoc={structure[group].content[subgroup].UOC}
                    subgroupTitle={subgroup}
                    courses={subgroupEntry.courses}
                  />
                );
              }
              return (
                <GridView
                  uoc={structure[group].content[subgroup].UOC}
                  subgroupTitle={subgroup}
                  courses={subgroupEntry.courses}
                  isCoursesOverflow={subgroupEntry.isCoursesOverflow}
                  isConcise={view === Views.GRID_CONCISE}
                />
              );
            },
          )}
        </Collapsible>
      ))}
    </S.ProgressionViewContainer>
  );
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [structure, setStructure] = useState<ProgramStructure>({});
  const [uoc, setUoc] = useState(0);

  const {
    programCode, specs,
  } = useSelector((state: RootState) => state.degree);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get<Structure>(`/programs/getStructure/${programCode}/${specs.join('+')}`);
        setStructure(res.data.structure);
        setUoc(res.data.uoc);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error at fetchStructure', err);
      }
      setIsLoading(false);
    };
    if (programCode && specs.length > 0) fetchStructure();
  }, [programCode, specs]);

  useEffect(() => {
    openNotification({
      type: 'info',
      message: 'Disclaimer',
      description: "This progression check is intended to outline the courses required by your degree and may not be 100% accurate. Please refer to UNSW's official progression check and handbook for further accuracy.",
    });
  }, []);

  return (
    <PageTemplate>
      <S.Wrapper>
        <Dashboard isLoading={isLoading} structure={structure} totalUOC={uoc} />
        <div id="divider"><Divider /></div>
        <ProgressionCheckerCourses structure={structure} />
      </S.Wrapper>
    </PageTemplate>
  );
};

export default ProgressionChecker;
