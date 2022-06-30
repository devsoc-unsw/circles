import React from "react";
import { useDispatch } from "react-redux";
import {
  LockOutlined, MinusOutlined, PlusOutlined, WarningOutlined,
} from "@ant-design/icons";
import {
  Button, Tooltip,
} from "antd";
import { motion } from "framer-motion/dist/framer-motion";
import axiosRequest from "config/axios";
import useMediaQuery from "hooks/useMediaQuery";
import { addTab } from "reducers/courseTabsSlice";
import { addToUnplanned, removeCourse } from "reducers/plannerSlice";
import S from "./styles";

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

const MenuItem = ({
  selected,
  courseCode,
  courseTitle,
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

  const removeFromPlanner = async (e, plannedCourse) => {
    e.stopPropagation();
    dispatch(removeCourse(plannedCourse));
  };

  const isSmall = useMediaQuery("(max-width: 1400px)");

  return (
    <motion.div transition={{ ease: "easeOut", duration: 0.3 }} layout>
      <S.MenuItemWrapper
        key={courseCode}
        selected={selected}
        active={activeCourse === courseCode}
        locked={!unlocked}
        onClick={handleClick}
      >
        <S.MenuItemContainer>
          <S.MenuItemCourseContainer>
            {isSmall ? (
              <Tooltip title={courseTitle} placement="topLeft">
                {courseCode}
              </Tooltip>
            ) : (
              <span>
                {courseCode}: {courseTitle}
              </span>
            )}
            {!accurate && (
              <TooltipWarningIcon
                text="We couldn't parse the requirement for this course. Please manually check if you have the correct prerequisites to unlock it."
              />
            )}
            {!unlocked && <LockOutlined style={{ fontSize: "11px" }} />}
          </S.MenuItemCourseContainer>
          {!selected ? (
            <Tooltip title="Add to Planner" placement="top">
              <Button
                onClick={(e) => addToPlanner(e, courseCode)}
                size="small"
                shape="circle"
                icon={<PlusOutlined />}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Remove from Planner" placement="top">
              <S.DeselectButton
                onClick={(e) => removeFromPlanner(e, courseCode)}
                size="small"
                shape="circle"
                icon={<MinusOutlined />}
              />
            </Tooltip>
          )}
        </S.MenuItemContainer>
      </S.MenuItemWrapper>
    </motion.div>
  );
};

export default MenuItem;
