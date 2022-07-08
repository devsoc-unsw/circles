import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addTab } from "reducers/courseTabsSlice";
import S from "./styles";

const CourseButton = ({ course, planned }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const courseCode = course.key;

  const handleCourseLink = (e) => {
    e.stopPropagation();
    navigate("/course-selector");
    dispatch(addTab(courseCode));
  };

  return (
    <S.CourseButton
      planned={planned}
      type="primary"
      key={course.key}
      onClick={handleCourseLink}
    >
      {course.key}: {course.title}
    </S.CourseButton>
  );
};

export default CourseButton;
