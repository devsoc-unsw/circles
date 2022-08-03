import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCourses } from "reducers/coursesSlice";
import { addTab } from "reducers/courseTabsSlice";
import prepareUserPayload from "../utils";
import CourseTitle from "./CourseTitle";
import LoadingSkeleton from "./LoadingSkeleton/LoadingSkeleton";
import S from "./styles";
import Title from "antd/lib/skeleton/Title";

const SubgroupTitle = ({ subGroup, group, coursesUnits }) => {
  const { curr, total } = coursesUnits[group][subGroup];
  return (
    <S.SubgroupHeader>
      {subGroup}
      <S.UOCBadge>
        {curr} / {total}
      </S.UOCBadge>
    </S.SubgroupHeader>
  );
};

const CourseSidebar = ({ structure, showLockedCourses }) => {
  const dispatch = useDispatch();
  const [menuData, setMenuData] = useState({});
  const [coursesUnits, setCoursesUnits] = useState({});

  // get courses in planner
  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);

  const [pageLoaded, setPageLoaded] = useState(false);

  // generate menu content
  const generateMenuData = (courses) => {
    const newMenu = {};
    const newCoursesUnits = {};

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

  const sortCourses = (item1, item2) => (item1.courseCode > item2.courseCode ? 1 : -1);

  const items = Object.entries(menuData).map(([group, groupEntry]) => ({
    label: structure[group].name ? `${group} - ${structure[group].name}` : group,
    key: group,
    children: Object
      .entries(groupEntry)
      .sort(sortSubgroups)
      .map(([subGroup, subGroupEntry]) => ({
        label: <SubgroupTitle
          subGroup={subGroup}
          group={group}
          coursesUnits={coursesUnits}
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
      })),
  }));

  const handleClick = (e) => {
    // course code is first 8 chars due to the key being course code + group + subGroup
    // to differentiate duplicate courses in different groups/subgroups
    const courseCode = e.key.slice(0, 8);
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
