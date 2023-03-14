import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import axios from 'axios';
import { Course, UnselectCourses } from 'types/api';
import { PlannerCourse } from 'types/planner';
import prepareUserPayload from 'utils/prepareUserPayload';
import type { RootState } from 'config/store';
import { addToUnplanned } from 'reducers/plannerSlice';
import S from './styles';
import { CourseList } from 'types/courses';

type Props = {
  courseCode: string;
  planned?: boolean;
};

const QuickAddCartButton = ({ courseCode, planned }: Props) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.settings);
  const { degree, planner } = useSelector((state: RootState) => state);

  const addToPlanner = async (e: React.MouseEvent<HTMLElement>, code: string) => {
    e.stopPropagation();
    try {
      const { data: course } = await axios.get<Course>(`/courses/getCourse/${code}`);

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
        mark: undefined
      };
      dispatch(addToUnplanned({ courseCode: course.code, courseData }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error at addToPlanner', err);
    }
  };

  const removeFromPlanner = async (e: React.MouseEvent<HTMLElement>, code: string) => {
    e.stopPropagation();
    try {
      const res = await axios.post<UnselectCourses>(
        `/courses/unselectCourse/${code}`,
        JSON.stringify(prepareUserPayload(degree, planner))
      );
      res.data.courses.forEach((course) => {
        axios.post(`/planner/removeCourse`, JSON.stringify({ courseCode: course }), {
          params: { token }
        });
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error at removeFromPlanner', err);
    }
  };

  return !planned ? (
    <Tooltip title="Add to Planner" placement="top">
      <Button
        data-testid="quick-add-cart-button"
        onClick={(e) => addToPlanner(e, courseCode)}
        size="small"
        shape="circle"
        icon={<PlusOutlined />}
      />
    </Tooltip>
  ) : (
    <Tooltip title="Remove from Planner" placement="top">
      <S.DeselectButton
        data-testid="quick-remove-cart-button"
        onClick={(e) => removeFromPlanner(e, courseCode)}
        size="small"
        shape="circle"
        icon={<MinusOutlined />}
      />
    </Tooltip>
  );
};

export default QuickAddCartButton;
