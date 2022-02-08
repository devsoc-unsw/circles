import React from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Menu } from "antd";
import { courseTabActions } from "../../../actions/courseTabActions";
import { Loading } from "./Loading";
import "./CourseMenu.less";
import { setCourses } from "../../../actions/coursesActions";

const { SubMenu } = Menu;

export default function CourseMenu() {
  const dispatch = useDispatch();
  const [structure, setStructure] = React.useState({});
  const [menuData, setMenuData] = React.useState({});
  const { active, tabs } = useSelector((state) => state.tabs);
  let id = tabs[active];

  // Exception tabs
  if (id === "explore" || id === "search") id = null;

  React.useEffect(() => {
    fetchStructure();
  }, []);

  // get structure of degree
  const fetchStructure = async () => {
    try {
      const res1 = await axios.get(
        "http://localhost:8000/programs/getStructure/3778/COMPA1"
      );
      setStructure(res1.data.structure);
    } catch (err) {
      console.log(err);
    }
  };

  // get all courses
  React.useEffect(async () => {
    try {
      console.log("hello");
      const res = await axios.post(
        `http://localhost:8000/courses/getAllUnlocked/`,
        JSON.stringify(payload),
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
  }, [structure]);

  const fetchAllCourses = () => {};

  // generate menu content
  const generateMenuData = (courses) => {
    let newMenu = {};
    // Example groups: Major, Minor, General
    for (const group in structure) {
      newMenu[group] = {};
      // Example subGroup: Core Courses, Computing Electives
      for (const subGroup in structure[group]) {
        if (typeof structure[group][subGroup] !== "string") {
          newMenu[group][subGroup] = [];
          const subCourses = Object.keys(structure[group][subGroup].courses); // e.g. [ "COMP3", "COMP4" ]
          const regex = subCourses.join("|"); // e.g. "COMP3|COMP4"
          for (const courseCode in courses) {
            if (
              courseCode.match(regex) &&
              courses[courseCode].is_accurate &&
              courses[courseCode].unlocked
            ) {
              newMenu[group][subGroup].push(courseCode);
            }
          }
        }
      }
    }
    setMenuData(newMenu);
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
                  <Menu.ItemGroup key={subGroup} title={subGroup}>
                    {menuData[group][subGroup].map((courseCode) => (
                      <MenuItem courseCode={courseCode} />
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

const MenuItem = ({ courseCode }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(courseTabActions("ADD_TAB", courseCode));
  };
  return (
    <Menu.Item className="text" key={courseCode} onClick={handleClick}>
      {courseCode}
    </Menu.Item>
  );
};

const payload = {
  program: "3778",
  specialisations: ["COMPA1"],
  courses: {},
  year: 0,
};
