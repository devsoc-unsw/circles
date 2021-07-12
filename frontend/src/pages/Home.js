import React from 'react';
import { useSelector, useDispatch } from "react-redux";
// import { updateDegree, resetDegree } from "../actions/updateDegree";
import { appendCourse, deleteCourse } from "../actions/updateCourses";
import { Button } from "antd";
import "../App.less";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const degree = useSelector((state) => {
    return state.degree;
  });
  const dispatch = useDispatch();

  return (
    <div>
      {degree == null ? (
        <div>
          Select your degree, replace with dropdown
          {/* <Button
            type="primary"
            onClick={() => dispatch(updateDegree("some chosen degree"))}
          >
            UPDATE
          </Button> */}
          <ThemeToggle />
        </div>
      ) : (
        <div>Hello! {degree}</div>
      )}
    </div>
  );
}