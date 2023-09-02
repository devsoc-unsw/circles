/* eslint-disable */
import React, { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LockFilled, UnlockFilled } from '@ant-design/icons';
import { Badge } from 'antd';
import { useTheme } from 'styled-components';
import { Term } from 'types/planner';
import { courseHasOffering } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';
import { CourseTime } from 'types/courses';
import { getCourseInfo } from 'utils/api/courseApi';
import axios from 'axios';
import { getToken } from 'utils/api/userApi';
import { useQuery, useQueryClient } from 'react-query';
import { Course } from 'types/api';

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

type Props = {
  name: string;
  coursesList: string[];
  draggingCourse?: string;
  currMultiCourseDrag: string;
  isLocked: boolean;
  courseInfo: Course;
};

const TermBox = ({ name, coursesList, draggingCourse, currMultiCourseDrag, isLocked, courseInfo }: Props) => {
  const year = name.slice(0, 4);
  const term = name.match(/T[0-3]/)?.[0] as Term;
  const theme = useTheme();
  const queryClient = useQueryClient();

const { isSummerEnabled, completedTerms, courses, /* isLocked */ } = useSelector(
    (state: RootState) => state.planner
  );
  const [totalUOC, setTotalUOC] = useState(0);
  // const dispatch = useDispatch();
  const handleToggleLockTerm = async () => {
    console.debug('name: ', name);
    const token = getToken();
    const res = await axios.post(
      '/user/planner/toggleTermComplete',
      { termyear: `${year}${term}` },
      { params: { token } }
    );
    if (res.status == 200) {
      queryClient.invalidateQueries('planner');
    }
  };

  useEffect(() => {
    let uoc = 0;
    Object.keys(courses).forEach((c) => {
      if (coursesList.includes(c)) uoc += courses[c].UOC;
    });
    setTotalUOC(uoc);
  }, [courses, coursesList]);

  // const isLocked = !!completedTerms[name];
  const offeredInTerm = !!draggingCourse && courseHasOffering(courses[draggingCourse], year, term);
  const isOffered = offeredInTerm && !isLocked;

  const isSmall = useMediaQuery('(max-width: 1400px)');

  const iconStyle = {
    fontSize: '12px',
    color: theme.termCheckbox.color
  };

  const uocBadgeStyle = {
    backgroundColor: theme.uocBadge.backgroundColor,
    boxShadow: 'none'
  };

  return (
    <Suspense fallback={<Spinner text="Loading Term..." />}>
      <Droppable droppableId={name} isDropDisabled={isLocked}>
        {(provided) => (
          <Badge
            count={
              <S.TermCheckboxWrapper checked={isLocked}>
                {
                  !isLocked ? (
                    <UnlockFilled style={iconStyle} onClick={handleToggleLockTerm} />
                  ) : (
                    <LockFilled style={iconStyle} onClick={handleToggleLockTerm} />
                  )
                }
              </S.TermCheckboxWrapper>
            }
            offset={isSummerEnabled ? [-13, 13] : [-22, 22]}
          >
            <S.TermBoxWrapper
              droppable={isOffered && !!draggingCourse}
              summerEnabled={isSummerEnabled}
              isSmall={isSmall}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {coursesList.map((code, index) => {
                return (
                  <DraggableCourse
                    key={`${code}${term}`}
                    course={getCourseInfo(courseCode)}
                    index={index}
                    time={{ year, term } as CourseTime}
                    {/* TODO: MULTITERM deprecate properly */}
                    showMultiCourseBadge={false}
                  />
                );
              })}
              {provided.placeholder}
              <S.UOCBadgeWrapper>
                <Badge
                  style={uocBadgeStyle}
                  size="small"
                  count={`${totalUOC} UOC`}
                  offset={[0, 0]}
                />
              </S.UOCBadgeWrapper>
            </S.TermBoxWrapper>
          </Badge>
        )}
      </Droppable>
    </Suspense>
  );
};

export default TermBox;
