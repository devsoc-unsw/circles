import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { PlannerCourse } from 'types/planner';
import API from 'utils/api';
import prepareUserPayload from 'utils/api/prepareUserPayload';
import { APICourse } from 'utils/api/types/responses';
import type { RootState } from 'config/store';
import { addToUnplanned, removeCourses } from 'reducers/plannerSlice';

interface PlannerButtonProps {
  course: APICourse;
}

const PlannerButton = ({ course }: PlannerButtonProps) => {
  const coursesInPlanner = useSelector((state: RootState) => state.planner.courses);
  const { degree, planner } = useSelector((state: RootState) => state);

  const id = course.code;
  const dispatch = useDispatch();
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
        isMultiterm: course.is_multiterm ?? false,
        supressed: false,
        mark: undefined
      };
      dispatch(addToUnplanned({ courseCode: course.code, courseData }));
      addCourseToPlannerTimeout(true);
    }
  };

  const removeFromPlanner = async () => {
    try {
      const res = await API.courses.unselect(id, prepareUserPayload(degree, planner));
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
