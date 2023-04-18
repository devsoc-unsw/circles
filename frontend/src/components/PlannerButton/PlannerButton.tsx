import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import axios from 'axios';
import { Course, UnselectCourses } from 'types/api';
import { badPlanner, PlannerResponse } from 'types/userResponse';
import { handleAddToUnplanned } from 'utils/api/plannerApi';
import { getUserPlanner } from 'utils/api/userApi';
import { removeCourses } from 'reducers/plannerSlice';

interface PlannerButtonProps {
  course: Course;
}

const PlannerButton = ({ course }: PlannerButtonProps) => {
  const id = course.code;
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const plannerQuery = useQuery('planner', getUserPlanner);

  // TODO avoid undefined by checking loading and error state
  // if (plannerQuery.isLoading) {
  // }
  // if (plannerQuery.isError) {
  // }

  const planner: PlannerResponse = plannerQuery.data || badPlanner;

  const addToUnplannedMutation = useMutation(handleAddToUnplanned, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: () => {
      // eslint-disable-next-line no-console
      console.error('Error adding to unplanned', addToUnplannedMutation.error);
    }
  });

  const coursesInPlanner = planner.courses;
  const [isAddedInPlanner, setIsAddedInPlanner] = useState(!!coursesInPlanner[id]);
  const [loading, setLoading] = useState(false);

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
      addToUnplannedMutation.mutate(id);
      addCourseToPlannerTimeout(true);
    }
  };

  // TODO will be deprecated
  const removeFromPlanner = async () => {
    try {
      const res = await axios.post<UnselectCourses>(
        `/courses/unselectCourse/${id}`
        // JSON.stringify(prepareUserPayload(degree, planner))
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
