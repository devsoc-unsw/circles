import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip, Menu, Button } from "antd";
import "./CourseMenu.less";
import { motion, AnimatePresence } from "framer-motion/dist/framer-motion";
import { WarningOutlined, PlusOutlined } from "@ant-design/icons";
import { ReactComponent as Padlock } from "../../../images/padlock.svg";
import axiosRequest from "../../../axios";
import prepareUserPayload from "../helper";
import Loading from "./Loading";
import { setCourses } from "../../../reducers/coursesSlice";
import { addTab } from "../../../reducers/courseTabsSlice";
import { addToUnplanned } from "../../../reducers/plannerSlice";

const { SubMenu } = Menu;

const CourseMenu = ({ structure, showLockedCourses }) => {
  const dispatch = useDispatch();
  const [menuData, setMenuData] = useState({});
  const [coursesUnits, setCoursesUnits] = useState({});
  const [activeCourse, setActiveCourse] = useState("");

  // get courses in planner
  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);

  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // generate menu content
  const generateMenuData = (courses) => {
    const newMenu = {};
    const newCoursesUnits = {};

    function sortMenu(item1, item2) {
      return item1.unlocked === item2.unlocked
        ? item1.courseCode > item2.courseCode // sort within locked/unlocked by courseCode
        : item1.unlocked < item2.unlocked; // separate locked/unlocked
    }

    // Example groups: Major, Minor, General
    Object.keys(structure).forEach((group) => {
      newMenu[group] = {};
      newCoursesUnits[group] = {};
      // Example subgroup: Core Courses, Computing Electives, Flexible Education
      Object.keys(structure[group]).forEach((subgroup) => {
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
              if (planner.courses[courseCode]) {
                newCoursesUnits[group][subgroup].curr
                    += planner.courses[courseCode].UOC;
              }
            });
          } else {
            // If there is no specified course list for the subgroup, then manually
            // show the added courses on the menu.
            Object.keys(planner.courses).forEach((courseCode) => {
              const courseData = planner.courses[courseCode];
              if (courseData && courseData.type === subgroup) {
                newMenu[group][subgroup].push(courseCode);
                // add UOC to curr
                newCoursesUnits[group][subgroup].curr += courseData.UOC;
              }
            });
          }
        }
      });
      if (structure[group].name) {
        // Append structure group name if exists
        const newGroup = `${group} - ${structure[group].name}`;
        newMenu[newGroup] = newMenu[group];
        newCoursesUnits[newGroup] = newCoursesUnits[group];
        delete newMenu[group];
        delete newCoursesUnits[group];
      }
    });
    setMenuData(newMenu);
    setCoursesUnits(newCoursesUnits);
    setIsPageLoaded(true);
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

  return (
    <div className="cs-menu-root">
      {isPageLoaded
        ? (
          <Menu
            onClick={() => {}}
            defaultSelectedKeys={[]}
            selectedKeys={[]}
            defaultOpenKeys={[Object.keys(menuData)[0]]}
            mode="inline"
            className="text"
          >
            {Object.entries(menuData).map(([group, groupEntry]) => (
              <SubMenu key={group} title={group}>
                {Object.entries(groupEntry).map(([subGroup, subGroupEntry]) => (
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
                      {subGroupEntry.map(
                        (course) => (course.unlocked || showLockedCourses) && (
                        <MenuItem
                          selected={planner.courses[course.courseCode] !== undefined}
                          courseCode={course.courseCode}
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
          </Menu>
        ) : (<Loading />)}
    </div>
  );
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
    dispatch(addTab(courseCode));
    setActiveCourse(courseCode);
  };

  const addToPlanner = async (e, plannedCourse) => {
    e.stopPropagation();
    const [course] = await axiosRequest(
      "get",
      `/courses/getCourse/${plannedCourse}`,
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
        warnings: [],
        handbookNote: course.handbook_note,
        isAccurate: course.is_accurate,
      },
    };
    dispatch(addToUnplanned(data));
  };

  return (
    <motion.div transition={{ ease: "easeOut", duration: 0.3 }} layout>
      <Menu.Item
        className={`text menuItemText
          ${selected && "bold"}
          ${activeCourse === courseCode && "activeCourse"}
          ${!unlocked && "locked"}`}
        key={courseCode}
        onClick={handleClick}
      >
        <div className="menuItemContainer">
          <div>
            {`${courseCode} `}
            {!accurate && (
              <TooltipWarningIcon
                text="We couldn't parse the requirement for this course. Please manually check if you have the correct prerequisites to unlock it."
              />
            )}
            {!unlocked && <Padlock width="10px" />}
          </div>
          {!selected && (
            <Tooltip title="Add to Planner" placement="bottom">
              <Button
                onClick={(e) => addToPlanner(e, courseCode)}
                size="small"
                shape="circle"
                icon={<PlusOutlined />}
                className="quickAddBtn"
              />
            </Tooltip>
          )}
        </div>
      </Menu.Item>
    </motion.div>
  );
};

const TooltipWarningIcon = ({ text }) => (
  <Tooltip placement="top" title={text}>
    <WarningOutlined
      style={{
        color: "#DC9930",
        fontSize: "16px",
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
