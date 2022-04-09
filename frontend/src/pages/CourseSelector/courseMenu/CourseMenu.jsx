/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip, Menu, Button } from "antd";
import "./CourseMenu.less";
import { IoWarningOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion/dist/framer-motion";
import { ReactComponent as Padlock } from "../../../images/padlock.svg";
import { axiosRequest } from "../../../axios";
import prepareUserPayload from "../helper";
import { Loading } from "./Loading";
import { courseTabActions } from "../../../actions/courseTabActions";
import { plannerActions } from "../../../actions/plannerActions";
import { setCourses } from "../../../actions/coursesActions";

const { SubMenu } = Menu;
// plz help wtf is this file
const CourseMenu = ({ structure, showLockedCourses }) => {
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

  const [isPageLoaded, setIsPageLoaded] = React.useState(false);

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
          const subgroupStructure = structure[group][subgroup];
          newCoursesUnits[group][subgroup] = {
            total: subgroupStructure.UOC,
            curr: 0,
          };

          newMenu[group][subgroup] = [];

          if (subgroupStructure.courses) {
            // only consider disciplinary component courses
            Object.keys(subgroupStructure.courses).forEach((courseCode) => {
              newMenu[group][subgroup].push({
                courseCode,
                unlocked: !!courses[courseCode],
                accuracy: courses[courseCode]
                  ? courses[courseCode].is_accurate
                  : true,
              });
              newMenu[group][subgroup].sort(sortMenu);

              // add UOC to curr
              if (coursesInPlanner.get(courseCode)) {
                newCoursesUnits[group][subgroup].curr
                    += coursesInPlanner.get(courseCode).UOC;
              }
            });
          } else {
            // If there is no specified course list for the subgroup, then manually
            // show the added courses on the menu.
            for (const courseCode of coursesInPlanner.keys()) {
              const courseData = coursesInPlanner.get(courseCode);
              if (courseData && courseData.type === subgroup) {
                newMenu[group][subgroup].push(courseCode);
                // add UOC to curr
                newCoursesUnits[group][subgroup].curr += courseData.UOC;
              }
            }
          }
        }
      }
      if (structure[group].name) {
        // Append structure group name if exists
        const newGroup = `${group} - ${structure[group].name}`;
        newMenu[newGroup] = newMenu[group];
        newCoursesUnits[newGroup] = newCoursesUnits[group];
        delete newMenu[group];
        delete newCoursesUnits[group];
      }
    }
    setMenuData(newMenu);
    setCoursesUnits(newCoursesUnits);
    setIsPageLoaded(true);
  };

  const getAllUnlocked = async () => {
    try {
      const res = await axios.post(
        "/courses/getAllUnlocked/",
        JSON.stringify(prepareUserPayload(degree, planner)),
      );
      dispatch(setCourses(res.data.courses_state));
      generateMenuData(res.data.courses_state);
    } catch (err) {
      console.log(err);
    }
  };
  // get all courses
  React.useEffect(() => {
    if (structure) { getAllUnlocked(); }
  });

  return (
    <div className="cs-menu-root">
      {!isPageLoaded ? (
        <Loading />
      ) : (
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
                  title={(
                    <SubgroupContainer
                      subGroup={subGroup}
                      group={group}
                      coursesUnits={coursesUnits}
                    />
                    )}
                >
                  <AnimatePresence initial={false}>
                    {menuData[group][subGroup].map(
                      (course, ind) => (course.unlocked || showLockedCourses) && (
                        <MenuItem
                          selected={coursesInPlanner.get(course.courseCode)}
                          courseCode={course.courseCode}
                          accurate={course.accuracy}
                          unlocked={course.unlocked}
                          setActiveCourse={setActiveCourse}
                          activeCourse={activeCourse}
                          subGroup={subGroup}
                          key={course.courseCode + group}
                        />
                      ),
                    )}
                  </AnimatePresence>
                </Menu.ItemGroup>
              ))}
            </SubMenu>
          ))}
        </Menu>
      )}
    </div>
  );
  function sortMenu(item1, item2) {
    return item1.unlocked === item2.unlocked
      ? item1.courseCode > item2.courseCode // sort within locked/unlocked by courseCode
      : item1.unlocked < item2.unlocked; // separate locked/unlocked
  }
};

const MenuItem = ({
  selected,
  courseCode,
  activeCourse,
  setActiveCourse,
  accurate,
  unlocked,
  subGroup,
}) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(courseTabActions("ADD_TAB", courseCode));
    setActiveCourse(courseCode);
  };

  const renderAccurateNote = () => {
    if (!accurate) {
      return <WarningIcon text="We couldn't parse the requirement for this course. Please manually check if you have the correct prerequisites to unlock it." />;
    }
  };

  const addToPlanner = async (e, courseCode) => {
    e.stopPropagation();
    const [course] = await axiosRequest(
      "get",
      `/courses/getCourse/${courseCode}`,
    );

    const data = {
      courseCode: course.code,
      courseData: {
        title: course.title,
        type: subGroup,
        termsOffered: course.terms,
        UOC: course.UOC,
        plannedFor: null,
        prereqs: course.raw_requirements,
        isLegacy: course.is_legacy,
        isUnlocked: true,
        warnings: "",
        handbook_note: "",
      },
    };
    dispatch(plannerActions("ADD_TO_UNPLANNED", data));
  };

  return (
    <motion.div transition={{ ease: "easeOut", duration: 0.3 }} layout>
      <Menu.Item
        className={`text menuItemText
          ${selected !== undefined && "bold"}
          ${activeCourse === courseCode && "activeCourse"}
          ${!unlocked && "locked"}`}
        key={courseCode}
        onClick={handleClick}
      >
        <div className="menuItemContainer">
          <div>
            {courseCode} {renderAccurateNote()}{" "}
            {!unlocked && <Padlock width="10px" />}
          </div>
          {!selected && (
            <Tooltip title="Add to Planner" placement="bottom">
              <Button
                onClick={(e) => addToPlanner(e, courseCode)}
                size="small"
                shape="circle"
                icon={<AiOutlinePlus />}
                className="quickAddBtn"
              />
            </Tooltip>
          )}
        </div>
      </Menu.Item>
    </motion.div>
  );
};

const WarningIcon = ({ text }) => (
  <Tooltip placement="top" title={text}>
    <IoWarningOutline
      size="1em"
      color="#DC9930"
      style={{
        marginLeft: "0.3em",
        textAlign: "center",
        top: "calc(50% - 0.5em)",
      }}
    />
  </Tooltip>
);

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

export default CourseMenu;
