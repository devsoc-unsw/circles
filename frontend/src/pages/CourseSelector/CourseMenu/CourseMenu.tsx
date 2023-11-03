/* eslint-disable */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MenuProps } from 'antd';
import axios from 'axios';
import { CoursesAllUnlocked, Structure } from 'types/api';
import { CourseUnitsStructure, MenuDataStructure, MenuDataSubgroup } from 'types/courseMenu';
import { CourseValidation } from 'types/courses';
import { ProgramStructure } from 'types/structure';
import getNumTerms from 'utils/getNumTerms';
import prepareUserPayload from 'utils/prepareUserPayload';
import { LoadingCourseMenu } from 'components/LoadingSkeleton';
import { MAX_COURSES_OVERFLOW } from 'config/constants';
import type { RootState } from 'config/store';
import { setCourses } from 'reducers/coursesSlice';
import { addTab } from 'reducers/courseTabsSlice';
import CourseMenuTitle from '../CourseMenuTitle';
import S from './styles';
import { getUserDegree, getUserPlanner } from 'utils/api/userApi';
import { QueryObserver, useMutation, useQuery, useQueryClient } from 'react-query';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { errLogger } from 'utils/queryUtils';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';

type SubgroupTitleProps = {
  title: string;
  currUOC: number;
  totalUOC: number;
};

type CourseMenuProps = {
  planner?: PlannerResponse;
  courses?: CoursesResponse;
  degree?: DegreeResponse;
};

const SubgroupTitle = ({ title, currUOC, totalUOC }: SubgroupTitleProps) => (
  <S.SubgroupHeader>
    <S.LabelTitle>{title}</S.LabelTitle>
    <S.UOCBadge>
      {currUOC} / {totalUOC}
    </S.UOCBadge>
  </S.SubgroupHeader>
);

const CourseMenu = ({ planner, courses, degree }: CourseMenuProps) => {
  const inPlanner = (courseId: string) => courses && !!courses[courseId];

  const getStructure = React.useCallback(async () => {
    if (!degree) return Promise.reject('degree undefined');
    const { programCode, specs } = degree;
    const res = await axios.get<Structure>(
      `/programs/getStructure/${programCode}/${specs.join('+')}`
    );
    return res.data.structure;
  }, [degree]);

  const getAllUnlocked = React.useCallback(async () => {
    if (!degree || !planner || !courses)
      return Promise.reject('degree, planner or courses undefined');
    const res = await axios.post<CoursesAllUnlocked>(
      '/courses/getAllUnlocked/',
      JSON.stringify(prepareUserPayload(degree, planner, courses))
    );
    return res.data.courses_state;
  }, [degree, planner, courses]);

  const structureQuery = useQuery(['structure', degree], getStructure, {
    onError: errLogger('structureQuery'),
    enabled: !!degree
  });

  const coursesStateQuery = useQuery(['coursesState', degree, planner, courses], getAllUnlocked, {
    onError: errLogger('coursesStateQuery'),
    onSuccess: (courses) => {
      dispatch(setCourses(courses)); // should maybe be deleted later or something
    },
    enabled: !!degree && !!planner && !!courses
  });

  useEffect(() => {
      if (!courses || !structureQuery.isSuccess || !coursesStateQuery.isSuccess) return;
      generateMenuData(courses, structureQuery.data, coursesStateQuery.data);
  }, [planner, structureQuery, coursesStateQuery, courses])

  const queryClient = useQueryClient();
  const courseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const handleMutation = inPlanner(courseId) ? removeCourse : addToUnplanned;
      await handleMutation(courseId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      await queryClient.invalidateQueries({ queryKey: ['planner'] });
    }
  });
  const runMutate = (courseId: string) => courseMutation.mutate(courseId);

  const dispatch = useDispatch();
  const [menuData, setMenuData] = useState<MenuDataStructure>({});
  const [coursesUnits, setCoursesUnits] = useState<CourseUnitsStructure | null>(null);

  const { showLockedCourses } = useSelector((state: RootState) => state.settings);

  const [pageLoaded, setPageLoaded] = useState(false);

  const generateMenuData = useCallback(
    (
      courses: CoursesResponse,
      structure: ProgramStructure,
      coursesState: Record<string, CourseValidation>
    ) => {
      const newMenu: MenuDataStructure = {};
      const newCoursesUnits: CourseUnitsStructure = {};
      // Example groups: Major, Minor, General, Rules
      Object.keys(structure).forEach((group) => {
        // Do not include 'Rules' group in sidebar or any other groups that do not
        // have subgroups
        if (group === 'Rules' || !Object.keys(structure[group].content).length) return;
        newMenu[group] = {};
        newCoursesUnits[group] = {};
        // Example subgroup: Core Courses, Computing Electives
        Object.keys(structure[group].content).forEach((subgroup) => {
          const subgroupStructure = structure[group].content[subgroup];
          newCoursesUnits[group][subgroup] = {
            total: subgroupStructure.UOC,
            curr: 0
          };
          newMenu[group][subgroup] = [];
          if (subgroupStructure.courses && !subgroupStructure.type.includes('rule')) {
            // only consider disciplinary component courses
            Object.keys(subgroupStructure.courses).forEach((courseCode) => {
              // suppress gen ed courses if it has not been added to the planner
              if (subgroupStructure.type === 'gened' && !coursesState[courseCode]) return;
              newMenu[group][subgroup].push({
                courseCode,
                title: subgroupStructure.courses[courseCode],
                unlocked: !!coursesState[courseCode]?.unlocked,
                accuracy: coursesState[courseCode] ? coursesState[courseCode].is_accurate : true
              });
              // add UOC to curr
              if (courses[courseCode] !== undefined) {
                newCoursesUnits[group][subgroup].curr += courses[courseCode].uoc;
              }
            });
          }
        });
      });
      setMenuData(newMenu);
      setCoursesUnits(newCoursesUnits);
      setPageLoaded(true);
    },
    []
  );

  const sortSubgroups = (
    item1: [string, MenuDataSubgroup[]],
    item2: [string, MenuDataSubgroup[]]
  ) => {
    if (/Core/.test(item1[0]) && !/Core/.test(item2[0])) {
      return -1;
    }

    if (/Core/.test(item2[0]) && !/Core/.test(item1[0])) {
      return 1;
    }

    return item1[0] > item2[0] ? 1 : -1;
  };

  const sortCourses = (item1: MenuDataSubgroup, item2: MenuDataSubgroup) =>
    item1.courseCode > item2.courseCode ? 1 : -1;

  const defaultOpenKeys = [Object.keys(menuData)[0]];

  let menuItems: MenuProps['items'];
  if (pageLoaded && structureQuery.isSuccess && courses) {
    const structure = structureQuery.data;
    menuItems = Object.entries(menuData).map(([groupKey, groupEntry]) => ({
      label: structure[groupKey].name ? `${groupKey} - ${structure[groupKey].name}` : groupKey,
      key: groupKey,
      children: Object.entries(groupEntry)
        .sort(sortSubgroups)
        .map(([subgroupKey, subGroupEntry]) => {
          const currUOC = coursesUnits ? coursesUnits[groupKey][subgroupKey].curr : 0;
          const totalUOC = coursesUnits ? coursesUnits[groupKey][subgroupKey].total : 0;
          if (subGroupEntry.length <= MAX_COURSES_OVERFLOW) defaultOpenKeys.push(subgroupKey);
          return {
            label: <SubgroupTitle title={subgroupKey} currUOC={currUOC} totalUOC={totalUOC} />,
            key: subgroupKey,
            disabled: !subGroupEntry.length, // disable submenu if there are no courses
            // check if there are courses to show collapsible submenu
            children: subGroupEntry.length
              ? subGroupEntry
                  .sort(sortCourses)
                  .filter(
                    (course) =>
                      course.unlocked ||
                      courses[course.courseCode] !== undefined ||
                      showLockedCourses
                  )
                  .map((course) => ({
                    label: (
                      <CourseMenuTitle
                        courseCode={course.courseCode}
                        title={course.title}
                        selected={courses[course.courseCode] !== undefined}
                        runMutate={runMutate}
                        accurate={course.accuracy}
                        unlocked={course.unlocked}
                      />
                    ),
                    // key is course code + groupKey + subgroupKey to differentiate as unique
                    // course items in menu
                    key: `${course.courseCode}-${groupKey}-${subgroupKey}`
                  }))
              : null
          };
        })
    }));
  }

  const handleClick = ({ key }: { key: string }) => {
    // course code is first 8 chars due to the key being course code + group + subGroup
    // to differentiate duplicate courses in different groups/subgroups
    const courseCode = key.slice(0, 8);
    dispatch(addTab(courseCode));
  };

  return (
    <S.SidebarWrapper>
      {pageLoaded ? (
        <S.Menu
          defaultSelectedKeys={[]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          mode="inline"
          onClick={handleClick}
        />
      ) : (
        <LoadingCourseMenu />
      )}
    </S.SidebarWrapper>
  );
};

export default CourseMenu;
