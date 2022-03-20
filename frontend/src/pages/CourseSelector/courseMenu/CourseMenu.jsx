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

export default function CourseMenu() {
  const dispatch = useDispatch();
  const [structure, setStructure] = React.useState({});
  const [menuData, setMenuData] = React.useState({});
  const [coursesUnits, setCoursesUnits] = React.useState({});
  const [activeCourse, setActiveCourse] = React.useState("");
  const { active, tabs } = useSelector((state) => state.tabs);
  let id = tabs[active];

  // Exception tabs
  if (id === "explore" || id === "search") id = null;

  React.useEffect(() => {
    fetchStructure();
  }, []);

  const { programCode, specialisation, minor } = useSelector(
    (state) => state.degree
  );

  // get structure of degree
  const fetchStructure = async () => {
    try {
      const res1 = await axios.get(
        `http://localhost:8000/programs/getStructure/${programCode}/${specialisation}/${
          minor !== "" ? minor : ""
        }`
      );
      setStructure(res1.data.structure);
    } catch (err) {
      console.log(err);
    }
  };

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
    let newMenu = {};
    let newCoursesUnits = {};

    // Example groups: Major, Minor, General
    for (const group in structure) {
      newMenu[group] = {};
      // Example subGroup: Core Courses, Computing Electives

      newCoursesUnits[group] = {};

      for (const subGroup in structure[group]) {
        if (typeof structure[group][subGroup] !== "string") {
          newCoursesUnits[group][subGroup] = {};
          newCoursesUnits[group][subGroup].total =
            structure[group][subGroup].UOC;
          newCoursesUnits[group][subGroup].curr = 0;

          newMenu[group][subGroup] = [];
          // only consider disciplinary component courses
          if (structure[group][subGroup].courses) {
            const subCourses = Object.keys(structure[group][subGroup].courses); // e.g. [ "COMP3", "COMP4" ]
            const regex = subCourses.join("|"); // e.g. "COMP3|COMP4"
            for (const courseCode in courses) {
              if (
                courseCode.match(regex) &&
                courses[courseCode].is_accurate &&
                courses[courseCode].unlocked
              ) {
                newMenu[group][subGroup].push(courseCode);
                // add UOC to curr
                if (coursesInPlanner.get(courseCode))
                  newCoursesUnits[group][subGroup].curr +=
                    coursesInPlanner.get(courseCode).UOC;
              }
            }
          } else {
            for (const courseCode of coursesInPlanner.keys()) {
              const courseData = coursesInPlanner.get(courseCode)
              if (courseData && courseData.type === subGroup) {
                newMenu[group][subGroup].push(courseCode);
                // add UOC to curr
                newCoursesUnits[group][subGroup].curr += courseData.UOC;
              }
            }
          }
        }
      }
      if (structure[group].name) {
        // Append structure group name if exists 
        const newGroup = `${group} - ${structure[group].name}`
        newMenu[newGroup] = newMenu[group]
        newCoursesUnits[newGroup] = newCoursesUnits[group]
        delete newMenu[group]
        delete newCoursesUnits[group]
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
