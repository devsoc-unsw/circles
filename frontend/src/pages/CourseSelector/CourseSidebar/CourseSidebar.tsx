import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { CourseValidation } from "types/courses";
import { ProgramStructure } from "types/structure";
import prepareUserPayload from "utils/prepareUserPayload";
import { RootState } from "config/store";
import { setCourses } from "reducers/coursesSlice";
import { addTab } from "reducers/courseTabsSlice";
import CourseTitle from "./CourseTitle";
import LoadingSkeleton from "./LoadingSkeleton/LoadingSkeleton";
import S from "./styles";

type Props = {
  structure: ProgramStructure
  showLockedCourses: boolean
};

type MenuDataSubgroup = {
  courseCode: string
  title: string
  unlocked: boolean
  accuracy: boolean
};

type MenuDataStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: MenuDataSubgroup[]
  }
};

type CourseUnitsStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: {
      total: number
      curr: number
    }
  }
};

type SubgroupTitleProps = {
  title: string
  currUOC: number
  totalUOC: number
};

const SubgroupTitle = ({ title, currUOC, totalUOC }: SubgroupTitleProps) => (
  <S.SubgroupHeader>
    {title}
    <S.UOCBadge>
      {currUOC} / {totalUOC}
    </S.UOCBadge>
  </S.SubgroupHeader>
);

const CourseSidebar = ({ structure, showLockedCourses }: Props) => {
  const dispatch = useDispatch();
  const [menuData, setMenuData] = useState<MenuDataStructure>({});
  const [coursesUnits, setCoursesUnits] = useState<CourseUnitsStructure>({});

  // get courses in planner
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);

  const [pageLoaded, setPageLoaded] = useState(false);

  // generate menu content
  const generateMenuData = (courses: CourseValidation[]) => {
    const newMenu: MenuDataStructure = {};
    const newCoursesUnits: CourseUnitsStructure = {};

    // Example groups: Major, Minor, General, Rules
    Object.keys(structure).forEach((group) => {
      // Do not include 'Rules' group in sidebar
      if (group === "Rules") return;

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

        if (subgroupStructure.courses && !subgroupStructure.type.includes("rule")) {
          // only consider disciplinary component courses
          Object.keys(subgroupStructure.courses).forEach((courseCode) => {
            // suppress gen ed courses if it has not been added to the planner
            if (subgroupStructure.type === "gened" && !planner.courses[courseCode]) return;

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
                  += planner.courses[courseCode].UOC;
            }
          });
        }
      });
    });
    setMenuData(newMenu);
    setCoursesUnits(newCoursesUnits);
    setPageLoaded(true);
  };

  const getAllUnlocked = useCallback(async () => {
    try {
      const res = await axios.post(
        "/courses/getAllUnlocked/",
        JSON.stringify(prepareUserPayload(degree, planner)),
      );
      dispatch(setCourses(res.data.courses_state));
      generateMenuData(res.data.courses_state);
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }, [planner, structure, degree]);

  // get all courses
  useEffect(() => {
    if (structure && Object.keys(structure).length) getAllUnlocked();
  }, [structure, getAllUnlocked]);

  const sortSubgroups = (item1, item2) => {
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

  const items = Object.entries(menuData).map(([group, groupEntry]) => ({
    label: structure[group].name ? `${group} - ${structure[group].name}` : group,
    key: group,
    children: Object
      .entries(groupEntry)
      .sort(sortSubgroups)
      .map(([subGroup, subGroupEntry]) => {
        const { curr, total } = coursesUnits[subGroup][subGroup];
        return {
          label: <SubgroupTitle
            title={subGroup}
            currUOC={curr}
            totalUOC={total}
          />,
          key: subGroup,
          children: subGroupEntry.sort(sortCourses)
            .filter((course) => course.unlocked || showLockedCourses)
            .map((course) => ({
              label: <CourseTitle
                courseCode={course.courseCode}
                title={course.title}
                selected={planner.courses[course.courseCode] !== undefined}
                accurate={course.accuracy}
                unlocked={course.unlocked}
              />,
              // key is course code + group + subGroup to differentiate as unique
              // course items in menu
              key: `${course.courseCode}-${group}-${subGroup}`,
            })),
          type: "group",
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
            defaultOpenKeys={[Object.keys(menuData)[0]]}
            items={items}
            mode="inline"
            onClick={handleClick}
          />
        )
        : <LoadingSkeleton />}
    </S.SidebarWrapper>
  );
};

export default CourseSidebar;
