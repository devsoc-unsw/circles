import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusOutlined, StopOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { PlannerCourse } from "types/planner";
import prepareUserPayload from "utils/prepareUserPayload";
import axiosRequest from "config/axios";
import { RootState } from "config/store";
import { addToUnplanned, removeCourses } from "reducers/plannerSlice";

const PlannerButton = () => {
  const { active, tabs } = useSelector((state: RootState) => state.courseTabs);
  const coursesInPlanner = useSelector((state: RootState) => state.planner.courses);
  const { course } = useSelector((state: RootState) => state.courses);
  const { degree, planner } = useSelector((state: RootState) => state);

  const id = tabs[active];
  const dispatch = useDispatch();
  const [addedCourseInPlanner, setAddedCourseInPlanner] = useState(!!coursesInPlanner[id]);
  const [loading, setLoading] = useState(false);

  const addCourseToPlannerTimeout = (isCourseInPlanner: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAddedCourseInPlanner(isCourseInPlanner);
    }, 1000);
  };

  useEffect(() => {
    if (!!coursesInPlanner[id] === addedCourseInPlanner) return;
    setLoading(true);
    addCourseToPlannerTimeout(!!coursesInPlanner[id]);
  }, [coursesInPlanner]);

  const addToPlanner = () => {
    const courseData: PlannerCourse = {
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
      isMultiterm: course.is_multiterm,
      supressed: false,
      mark: null,
    };
    dispatch(addToUnplanned({ courseCode: course.code, courseData }));
    addCourseToPlannerTimeout(true);
  };

  const removeFromPlanner = async () => {
    const [data] = await axiosRequest("post", `/courses/unselectCourse/${id}`, prepareUserPayload(degree, planner));
    addCourseToPlannerTimeout(false);
    dispatch(removeCourses(data.courses));
  };

  return (
    addedCourseInPlanner ? (
      <Button
        loading={loading}
        onClick={removeFromPlanner}
        icon={<StopOutlined />}
      >
        {!loading ? "Remove from planner" : "Removing from planner"}
      </Button>
    ) : (
      <Button
        loading={loading}
        onClick={addToPlanner}
        icon={<PlusOutlined />}
        type="primary"
      >
        {!loading ? "Add to planner" : "Adding to planner"}
      </Button>
    )
  );
};

export default PlannerButton;