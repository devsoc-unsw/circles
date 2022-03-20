import React from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Menu } from "antd";
import { courseTabActions } from "../../../actions/courseTabActions";
import { Loading } from "./Loading";
import "./CourseMenu.less";
import { setCourses } from "../../../actions/coursesActions";
import { prepareUserPayload } from "../helper";

const { SubMenu } = Menu;

export default function CourseMenu({structure}) {
  const dispatch = useDispatch();
  const [menuData, setMenuData] = React.useState({});
  const [coursesUnits, setCoursesUnits] = React.useState({});
  const [activeCourse, setActiveCourse] = React.useState("");
  const { active, tabs } = useSelector((state) => state.tabs);
  let id = tabs[active];

  // Exception tabs
  if (id === "explore" || id === "search") id = null;

  // get courses in planner
  const planner = useSelector((state) => state.planner);
  const coursesInPlanner = planner.courses;
  const degree = useSelector((state) => state.degree);

  // get all courses
  React.useEffect(async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/courses/getAllUnlocked/`,
        JSON.stringify(prepareUserPayload(degree, planner)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(setCourses(res.data.courses_state));
      generateMenuData(res.data.courses_state);
    } catch (err) {
      console.log(err);
    }
  }, [structure, coursesInPlanner]);

  // generate menu content
  const generateMenuData = (courses) => {
    const newMenu = {};
    const newCoursesUnits = {};

    // Example groups: Major, Minor, General
    for (const group in structure) {
      newMenu[group] = {};
      newCoursesUnits[group] = {};

      // Example subgroup: Core Courses, Computing Electives, Flexible Education
      for (const subgroup in structure[group]) {
        if (typeof structure[group][subgroup] !== "string") {
          // case where structure[group][subgroup] gives information on courses in an object 
          const subgroupStructure = structure[group][subgroup]
          newCoursesUnits[group][subgroup] = {
            total: subgroupStructure.UOC,
            curr: 0
          };

          newMenu[group][subgroup] = [];

          if (subgroupStructure.courses) {
            // only consider disciplinary component courses
            const subCourses = Object.keys(subgroupStructure.courses); // e.g. [ "COMP3", "COMP4" ]
            const regex = subCourses.join("|"); // e.g. "COMP3|COMP4"
            for (const courseCode in courses) {
              if (
                courseCode.match(regex) &&
                courses[courseCode].is_accurate &&
                courses[courseCode].unlocked
              ) {
                newMenu[group][subgroup].push(courseCode);
                // add UOC to curr
                if (coursesInPlanner.get(courseCode))
                  newCoursesUnits[group][subgroup].curr +=
                    coursesInPlanner.get(courseCode).UOC;
              }
            }
          } else {
            // If there is no specified course list for the subgroup, then manually
            // show the added courses on the menu.
            for (const courseCode of coursesInPlanner.keys()) {
              const courseData = coursesInPlanner.get(courseCode)
              if (courseData && courseData.type === subgroup) {
                newMenu[group][subgroup].push(courseCode);
                // add UOC to curr
                newCoursesUnits[group][subgroup].curr += courseData.UOC;
              }
            }
          }
        }
      }
    }
    setMenuData(newMenu);
    setCoursesUnits(newCoursesUnits);
  };

  return (
    <div className="cs-menu-root">
      {structure === null ? (
        <Loading />
      ) : (
        <>
          <Menu
            onClick={() => {}}
            defaultSelectedKeys={[]}
            selectedKeys={[]}
            defaultOpenKeys={[[...Object.keys(structure)][0]]}
            mode="inline"
            className="text"
          >
            {Object.keys(menuData).map((group) => (
              <SubMenu key={group} title={group}>
                {Object.keys(menuData[group]).map((subGroup) => (
                  <Menu.ItemGroup
                    key={subGroup}
                    title={
                      <SubgroupContainer
                        subGroup={subGroup}
                        group={group}
                        coursesUnits={coursesUnits}
                      />
                    }
                  >
                    {menuData[group][subGroup].map((courseCode) => (
                      <MenuItem
                        selected={coursesInPlanner.get(courseCode)}
                        courseCode={courseCode}
                        setActiveCourse={setActiveCourse}
                        activeCourse={activeCourse}
                      />
                    ))}
                  </Menu.ItemGroup>
                ))}
              </SubMenu>
            ))}
          </Menu>
        </>
      )}
    </div>
  );
}

const MenuItem = ({ selected, courseCode, activeCourse, setActiveCourse }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(courseTabActions("ADD_TAB", courseCode));
    setActiveCourse(courseCode);
  };

  return (
    <Menu.Item
      className={`text menuItemText ${selected !== undefined && "bold"} 
      ${activeCourse === courseCode && "activeCourse"}`}
      key={courseCode}
      onClick={handleClick}
    >
      {courseCode}
    </Menu.Item>
  );
};

const SubgroupContainer = ({ subGroup, group, coursesUnits }) => {
  const { curr, total } = coursesUnits[group][subGroup];
  return (
    <div className="subgroupContainer">
      <div>{subGroup}</div>
      <div className="uocBadge">
        {curr} / {total}
      </div>
    </div>
  );
};
