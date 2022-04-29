import { PlusOutlined, StopOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosRequest from "../../../axios";
import { addToUnplanned, removeCourses } from "../../../reducers/plannerSlice";
import prepareUserPayload from "../helper";

const AddToPlannerButton = () => {
  const { active, tabs } = useSelector((state) => state.courseTabs);
  const coursesInPlanner = useSelector((state) => state.planner.courses);
  const course = useSelector((state) => state.courses.course);

  const id = tabs[active];
  const dispatch = useDispatch();
  const [addedCourseInPlanner, setAddedCourseInPlanner] = useState(!!coursesInPlanner[id]);
  const [loading, setLoading] = useState(false);

  const { degree, planner } = useSelector((state) => state);

  const addCourseToPlannerTimeout = (courseInPlanner) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAddedCourseInPlanner(courseInPlanner);
    }, 1000);
  };

  useEffect(() => {
    if (!!coursesInPlanner[id] === addedCourseInPlanner) return;
    setLoading(true);
    addCourseToPlannerTimeout(!!coursesInPlanner[id]);
  }, [coursesInPlanner]);

  const addToPlanner = (type) => {
    const data = {
      courseCode: course.code,
      courseData: {
        title: course.title,
        type,
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
    addCourseToPlannerTimeout(true);
  };

  const removeFromPlanner = async () => {
    const [data] = await axiosRequest("post", `/courses/unselectCourse/${id}`, prepareUserPayload(degree, planner));
    addCourseToPlannerTimeout(false);
    dispatch(removeCourses(data.affected_courses));
  };

  return (
    addedCourseInPlanner ? (
      <Button
        type="secondary"
        loading={loading}
        onClick={removeFromPlanner}
        icon={<StopOutlined />}
      >
        {!loading ? "Remove from planner" : "Removing from planner"}
      </Button>
    ) : (
      <Button
        loading={loading}
        onClick={() => {
          addToPlanner("Uncategorised");
        }}
        icon={<PlusOutlined />}
        type="primary"
      >
        {!loading ? "Add to planner" : "Adding to planner"}
      </Button>
    )
  );
};

export default AddToPlannerButton;
