import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LockOutlined, MinusOutlined, PlusOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import axios from 'axios';
import { Course, UnselectCourses } from 'types/api';
import { PlannerCourse } from 'types/planner';
import prepareUserPayload from 'utils/prepareUserPayload';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import { addToUnplanned, removeCourses } from 'reducers/plannerSlice';
import S from './styles';

type Props = {
  courseCode: string
  selected: boolean
  accurate: boolean
  unlocked: boolean
  title: string
};

const CourseTitle = ({
  courseCode, selected, accurate, unlocked, title,
}: Props) => {
  const dispatch = useDispatch();

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
        mark: undefined,
      };
      dispatch(addToUnplanned({ courseCode: course.code, courseData }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error at addToPlanner', err);
    }
  };

  const removeFromPlanner = async (e: React.MouseEvent<HTMLElement>, code: string) => {
    e.stopPropagation();
    try {
      const res = await axios.post<UnselectCourses>(`/courses/unselectCourse/${code}`, JSON.stringify(prepareUserPayload(degree, planner)));
      dispatch(removeCourses(res.data.courses));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error at removeFromPlanner', err);
    }
  };

  const isSmall = useMediaQuery('(max-width: 1400px)');

  return (
    <S.Wrapper>
      {isSmall ? (
        <Tooltip title={title} placement="topLeft">
          <S.CourseTitleWrapper selected={selected} locked={!unlocked}>
            {courseCode}
          </S.CourseTitleWrapper>
        </Tooltip>
      ) : (
        <S.CourseTitleWrapper selected={selected} locked={!unlocked}>
          {courseCode}: {title}
        </S.CourseTitleWrapper>
      )}
      <S.IconsWrapper>
        {!accurate && (
          <Tooltip
            placement="top"
            title="We couldn't parse the requirement for this course. Please manually check if you have the correct prerequisites to unlock it."
          >
            <WarningOutlined
              style={{
                color: '#DC9930',
                fontSize: '16px',
              }}
            />
          </Tooltip>
        )}
        {!unlocked && <LockOutlined style={{ fontSize: '12px' }} />}
        {!selected ? (
          <Tooltip title="Add to Planner" placement="top">
            <Button
              onClick={(e) => addToPlanner(e, courseCode)}
              size="small"
              shape="circle"
              icon={<PlusOutlined />}
            />
          </Tooltip>
        ) : (
          <Tooltip title="Remove from Planner" placement="top">
            <S.DeselectButton
              onClick={(e) => removeFromPlanner(e, courseCode)}
              size="small"
              shape="circle"
              icon={<MinusOutlined />}
            />
          </Tooltip>
        )}
      </S.IconsWrapper>
    </S.Wrapper>
  );
};

export default CourseTitle;
