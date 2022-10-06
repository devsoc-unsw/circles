import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MenuProps } from 'antd';
import axios from 'axios';
import { CoursesAllUnlocked } from 'types/api';
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
import CourseTitle from './CourseTitle';
import S from './styles';

type Props = {
  structure: ProgramStructure
};

type SubgroupTitleProps = {
  title: string
  currUOC: number
  totalUOC: number
};

const SubgroupTitle = ({ title, currUOC, totalUOC }: SubgroupTitleProps) => (
  <S.SubgroupHeader>
    <S.LabelTitle>{title}</S.LabelTitle>
    <S.UOCBadge>
      {currUOC} / {totalUOC}
    </S.UOCBadge>
  </S.SubgroupHeader>
);

const CourseMenu = ({ structure }: Props) => {
  const dispatch = useDispatch();
  const [menuData, setMenuData] = useState<MenuDataStructure>({});
  const [coursesUnits, setCoursesUnits] = useState<CourseUnitsStructure | null>(null);

  // get courses in planner
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);
  const { showLockedCourses } = useSelector((state: RootState) => state.settings);
  const [pageLoaded, setPageLoaded] = useState(false);

  const getAllUnlocked = useCallback(async () => {
    // generate menu content
    const generateMenuData = (courses: Record<string, CourseValidation>) => {
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
            curr: 0,
          };
          newMenu[group][subgroup] = [];

          if (subgroupStructure.courses && !subgroupStructure.type.includes('rule')) {
            // only consider disciplinary component courses
            Object.keys(subgroupStructure.courses).forEach((courseCode) => {
              // suppress gen ed courses if it has not been added to the planner
              if (subgroupStructure.type === 'gened' && !planner.courses[courseCode]) return;
              newMenu[group][subgroup].push({
                courseCode,
                title: subgroupStructure.courses[courseCode],
                unlocked: !!courses[courseCode],
                accuracy: courses[courseCode]
                  ? courses[courseCode].is_accurate
                  : true,
              });
              // add UOC to curr
              if (planner.courses[courseCode]) {
                newCoursesUnits[group][subgroup].curr
                  += planner.courses[courseCode].UOC * getNumTerms(
                    planner.courses[courseCode].UOC,
                    planner.courses[courseCode].isMultiterm,
                  );
              }
            });
          }
        });
      });
      setMenuData(newMenu);
      setCoursesUnits(newCoursesUnits);
      setPageLoaded(true);
    };

    try {
      const res = await axios.post<CoursesAllUnlocked>(
        '/courses/getAllUnlocked/',
        JSON.stringify(prepareUserPayload(degree, planner)),
      );
      dispatch(setCourses(res.data.courses_state));
      generateMenuData(res.data.courses_state);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error at getAllUnlocked', err);
    }
  }, [structure, planner, degree, dispatch]);

  // get all courses
  useEffect(() => {
    if (structure && Object.keys(structure).length) getAllUnlocked();
  }, [structure, getAllUnlocked]);

  const sortSubgroups = (
    item1: [string, MenuDataSubgroup[]],
    item2: [string, MenuDataSubgroup[]],
  ) => {
    if (/Core/.test(item1[0]) && !/Core/.test(item2[0])) {
      return -1;
    }

    if (/Core/.test(item2[0]) && !/Core/.test(item1[0])) {
      return 1;
    }

    return item1[0] > item2[0] ? 1 : -1;
  };

  const sortCourses = (item1: MenuDataSubgroup, item2: MenuDataSubgroup) => (
    item1.courseCode > item2.courseCode ? 1 : -1
  );

  const defaultOpenKeys = [Object.keys(menuData)[0]];

  const menuItems: MenuProps['items'] = Object.entries(menuData).map(([groupKey, groupEntry]) => ({
    label: structure[groupKey].name ? `${groupKey} - ${structure[groupKey].name}` : groupKey,
    key: groupKey,
    children: Object
      .entries(groupEntry)
      .sort(sortSubgroups)
      .map(([subgroupKey, subGroupEntry]) => {
        const currUOC = coursesUnits ? coursesUnits[groupKey][subgroupKey].curr : 0;
        const totalUOC = coursesUnits ? coursesUnits[groupKey][subgroupKey].total : 0;
        if (subGroupEntry.length <= MAX_COURSES_OVERFLOW) defaultOpenKeys.push(subgroupKey);
        return {
          label: <SubgroupTitle
            title={subgroupKey}
            currUOC={currUOC}
            totalUOC={totalUOC}
          />,
          key: subgroupKey,
          disabled: !subGroupEntry.length, // disable submenu if there are no courses
          // check if there are courses to show collapsible submenu
          children: subGroupEntry.length ? subGroupEntry.sort(sortCourses)
            .filter((course) => (
              course.unlocked
              || showLockedCourses
              || planner.courses[course.courseCode]))
            .map((course) => ({
              label: <CourseTitle
                courseCode={course.courseCode}
                title={course.title}
                selected={planner.courses[course.courseCode] !== undefined}
                accurate={course.accuracy}
                unlocked={course.unlocked}
              />,
              // key is course code + groupKey + subgroupKey to differentiate as unique
              // course items in menu
              key: `${course.courseCode}-${groupKey}-${subgroupKey}`,
            })) : null,
        };
      }),
  }));
  const handleClick = ({ key }: { key: string }) => {
    // course code is first 8 chars due to the key being course code + group + subGroup
    // to differentiate duplicate courses in different groups/subgroups
    const courseCode = key.slice(0, 8);
    dispatch(addTab(courseCode));
  };
  return (
    <S.SidebarWrapper>
      {pageLoaded
        ? (
          <S.Menu
            defaultSelectedKeys={[]}
            defaultOpenKeys={defaultOpenKeys}
            items={menuItems}
            mode="inline"
            onClick={handleClick}
          />
        )
        : <LoadingCourseMenu />}
    </S.SidebarWrapper>
  );
};

export default CourseMenu;
