import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu } from "antd";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { setCourses } from "reducers/coursesSlice";
import prepareUserPayload from "../utils";
import LoadingSkeleton from "./LoadingSkeleton/LoadingSkeleton";
import MenuItem from "./MenuItem";
import S from "./styles";
import Title from "antd/lib/skeleton/Title";

const { SubMenu } = Menu;

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
  const [activeCourse, setActiveCourse] = useState("");

  // get courses in planner
  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);

  const [pageLoaded, setPageLoaded] = useState(false);

  // generate menu content
  const generateMenuData = (courses) => {
    const newMenu = {};
    const newCoursesUnits = {};

    const sortMenu = (item1, item2) => (
      item1.unlocked === item2.unlocked
        ? item1.courseCode > item2.courseCode // sort within locked/unlocked by courseCode
        : item1.unlocked < item2.unlocked // separate locked/unlocked
    );

    // Example groups: Major, Minor, General, Rules
    Object.keys(structure).forEach((group) => {
      // Do not include 'Rules' group in sidebar
      if (group === "Rules") return;

      newMenu[group] = {};
      newCoursesUnits[group] = {};

      // Example subgroup: Core Courses, Computing Electives
      Object.keys(structure[group]).forEach((subgroup) => {
        // Do not include if field is not an object i.e. 'name' field
        if (typeof structure[group][subgroup] === "string") return;

        const subgroupStructure = structure[group][subgroup];

        newCoursesUnits[group][subgroup] = {
          total: subgroupStructure.UOC,
          curr: 0,
        };
        newMenu[group][subgroup] = [];

        const isRule = subgroupStructure.type && subgroupStructure.type.includes("rule");

        if (subgroupStructure.courses && !isRule) {
          // only consider disciplinary component courses
          Object.keys(subgroupStructure.courses).forEach((courseCode) => {
            newMenu[group][subgroup].push({
              courseCode,
              title: subgroupStructure.courses[courseCode],
              unlocked: !!courses[courseCode],
              accuracy: courses[courseCode]
                ? courses[courseCode].is_accurate
                : true,
            });
            newMenu[group][subgroup].sort(sortMenu);

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

  const sortGroups = (item1, item2) => {
    if (/Core/.test(item1[0]) && !/Core/.test(item2[0])) {
      return -1;
    }

    if (/Core/.test(item2[0]) && !/Core/.test(item1[0])) {
      return 1;
    }

    return item1[0] > item2[0];
  };

  return (
    <S.SidebarWrapper>
      {pageLoaded
        ? (
          <S.Menu
            onClick={() => { }}
            defaultSelectedKeys={[]}
            selectedKeys={[]}
            defaultOpenKeys={[Object.keys(menuData)[0]]}
            mode="inline"
          >
            {Object.entries(menuData).map(([group, groupEntry]) => (
              <SubMenu key={group} title={structure[group].name ? `${group} - ${structure[group].name}` : group}>
                {Object.entries(groupEntry).sort(sortGroups).map(([subGroup, subGroupEntry]) => (
                  <Menu.ItemGroup
                    key={subGroup}
                    title={(
                      <SubgroupTitle
                        subGroup={subGroup}
                        group={group}
                        coursesUnits={coursesUnits}
                      />
                    )}
                  >
                    <AnimatePresence initial={false}>
                      {subGroupEntry.map(
                        (course) => (course.unlocked || showLockedCourses) && (
                        <MenuItem
                          selected={planner.courses[course.courseCode] !== undefined}
                          courseCode={course.courseCode}
                          courseTitle={course.title}
                          accurate={course.accuracy}
                          unlocked={course.unlocked}
                          setActiveCourse={setActiveCourse}
                          activeCourse={activeCourse}
                          subGroup={subGroup}
                          key={`${course.courseCode}-${group}`}
                        />
                        ),
                      )}
                    </AnimatePresence>
                  </Menu.ItemGroup>
                ))}
              </SubMenu>
            ))}
          </S.Menu>
        ) : (<LoadingSkeleton />)}
    </S.SidebarWrapper>
  );
};

export default CourseSidebar;
