import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import axios from 'axios';
import { Course, UnselectCourses } from 'types/api';
import prepareUserPayload from 'utils/prepareUserPayload';
import type { RootState } from 'config/store';
import { removeCourses } from 'reducers/plannerSlice';

interface PlannerButtonProps {
  course: Course;
}

const PlannerButton = ({ course }: PlannerButtonProps) => {
  const coursesInPlanner = useSelector((state: RootState) => state.planner.courses);
  const { degree, planner } = useSelector((state: RootState) => state);
  const { token } = useSelector((state: RootState) => state.settings);

  const id = course.code;
  const dispatch = useDispatch();
  const [isAddedInPlanner, setIsAddedInPlanner] = useState(!!coursesInPlanner[id]);
  const [loading, setLoading] = useState(false);

  const handleAddToUnplanned = async () => {
    try {
      await axios.post('planner/addToUnplanned', { courseCode: id }, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error at handleAddToUnplanned: ', err);
    }
  };

  const addCourseToPlannerTimeout = (isCourseInPlanner: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsAddedInPlanner(isCourseInPlanner);
    }, 1000);
  };

  useEffect(() => {
    if (!!coursesInPlanner[id] === isAddedInPlanner) return;
    setLoading(true);
    addCourseToPlannerTimeout(!!coursesInPlanner[id]);
  }, [coursesInPlanner, id, isAddedInPlanner]);

  const addToPlanner = () => {
    if (course) {
      handleAddToUnplanned();
      addCourseToPlannerTimeout(true);
    }
  };

  const removeFromPlanner = async () => {
    try {
      const res = await axios.post<UnselectCourses>(
        `/courses/unselectCourse/${id}`,
        JSON.stringify(prepareUserPayload(degree, planner))
      );
      addCourseToPlannerTimeout(false);
      dispatch(removeCourses(res.data.courses));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at removeFromPlanner', e);
    }
  };

  return isAddedInPlanner ? (
    <Button loading={loading} onClick={removeFromPlanner} icon={<StopOutlined />}>
      {!loading ? 'Remove from planner' : 'Removing from planner'}
    </Button>
  ) : (
    <Button loading={loading} onClick={addToPlanner} icon={<PlusOutlined />} type="primary">
      {!loading ? 'Add to planner' : 'Adding to planner'}
    </Button>
  );
};

export default PlannerButton;
