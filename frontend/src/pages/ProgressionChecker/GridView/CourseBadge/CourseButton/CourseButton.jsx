import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { addTab } from "reducers/courseTabsSlice";

const CourseButton = ({ course, planned }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCourseLink = (courseCode) => {
    navigate("/course-selector");
    dispatch(addTab(courseCode));
  };

  return (
    planned ? (
      <Button
        className="checkerButton"
        type="primary"
        key={course.key}
        onClick={() => handleCourseLink(course.key)}
      >
        {course.key}: {course.title}
      </Button>
    ) : (
      <Button
        className="checkerButton"
        type="primary"
        style={{ background: "#FFF", color: "#9254de" }}
        key={course.key}
        onClick={() => handleCourseLink(course.key)}
      >
        {course.key}: {course.title}
      </Button>
    )
  );
};

export default CourseButton;
