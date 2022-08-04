import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LockOutlined, MinusOutlined, PlusOutlined, WarningOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import axiosRequest from "config/axios";
import { RootState } from "config/store";
import useMediaQuery from "hooks/useMediaQuery";
import prepareUserPayload from "pages/CourseSelector/utils";
import { addToUnplanned, removeCourses } from "reducers/plannerSlice";
import S from "./styles";

type Props = {
  courseCode: string
  selected: boolean
  accurate: boolean
  unlocked: boolean
  title: string
};

const CourseTitle = ({
  courseCode, selected, accurate, unlocked, title,
}: Props) => {
  const dispatch = useDispatch();

  const { degree, planner } = useSelector((state: RootState) => state);

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
    const [data] = await axiosRequest("post", `/courses/unselectCourse/${plannedCourse}`, prepareUserPayload(degree, planner));
    dispatch(removeCourses(data.courses));
  };

  const isSmall = useMediaQuery("(max-width: 1400px)");

  return (
    <S.Wrapper>
      {isSmall ? (
        <Tooltip title={title} placement="topLeft">
          <S.CourseTitleWrapper selected={selected} locked={!unlocked}>
            {courseCode}
          </S.CourseTitleWrapper>
        </Tooltip>
      ) : (
        <S.CourseTitleWrapper selected={selected} locked={!unlocked}>
          {courseCode}: {title}
        </S.CourseTitleWrapper>
      )}
      <S.IconsWrapper>
        {!accurate && (
          <Tooltip
            placement="top"
            title="We couldn't parse the requirement for this course. Please manually check if you have the correct prerequisites to unlock it."
          >
            <WarningOutlined
              style={{
                color: "#DC9930",
                fontSize: "16px",
              }}
            />
          </Tooltip>
        )}
        {!unlocked && <LockOutlined style={{ fontSize: "12px" }} />}
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
      </S.IconsWrapper>
    </S.Wrapper>
  );
};

export default CourseTitle;
