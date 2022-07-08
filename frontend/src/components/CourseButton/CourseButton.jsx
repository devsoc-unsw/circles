import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { addTab } from "reducers/courseTabsSlice";
import S from "./styles";

const CourseButton = ({ course, planned }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const courseCode = course.key;

  const handleCourseLink = (e) => {
    e.stopPropagation();
    router.push("/course-selector");
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
