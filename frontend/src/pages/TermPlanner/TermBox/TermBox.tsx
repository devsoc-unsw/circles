import React, { Suspense } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LockFilled, UnlockFilled } from '@ant-design/icons';
import { Badge } from 'antd';
import { useTheme } from 'styled-components';
import { Course } from 'types/api';
import { CourseTime } from 'types/courses';
import { Term } from 'types/planner';
import { badPlanner, PlannerResponse } from 'types/userResponse';
import { getUserPlanner } from 'utils/api/userApi';
import { courseHasOfferingNew } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';
import axios from 'axios';
import { getToken } from 'utils/api/userApi';

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

type Props = {
  name: string; // Ideally replace this with a proper term type later
  courseInfos: Record<string, Course>; // All courses in planner
  termCourseCodes: string[]; // Course codes in the current term
  draggingCourseCode?: string;
};

const TermBox = ({ name, courseInfos, termCourseCodes, draggingCourseCode }: Props) => {
  const year = name.slice(0, 4);
  const term = name.match(/T[0-3]/)?.[0] as Term;
  const theme = useTheme();
  const queryClient = useQueryClient();

  const plannerQuery = useQuery('planner', getUserPlanner);
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;
  const { isSummerEnabled } = planner;

  const handleToggleLockTerm = async () => {
    console.debug('name: ', name);
    const token = getToken();
    const res = await axios.post(
      '/user/planner/toggleTermLocked',
      { termyear: `${year}${term}` },
      { params: { token } }
    );
    if (res.status == 200) {
      queryClient.invalidateQueries('planner');
    }
  };

  const termUOC = termCourseCodes.reduce((acc, code) => acc + courseInfos[code].UOC, 0);

  const isLocked = planner.lockedTerms[`${year}${term}`];
  const offeredInTerm =
    !!draggingCourseCode && courseHasOfferingNew(courseInfos[draggingCourseCode], term);
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
                {!isLocked ? (
                  <UnlockFilled style={iconStyle} onClick={handleToggleLockTerm} />
                ) : (
                  <LockFilled style={iconStyle} onClick={handleToggleLockTerm} />
                )}
              </S.TermCheckboxWrapper>
            }
            offset={isSummerEnabled ? [-13, 13] : [-22, 22]}
          >
            <S.TermBoxWrapper
              droppable={isOffered && !!draggingCourseCode}
              summerEnabled={isSummerEnabled}
              isSmall={isSmall}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {Object.values(courseInfos).map((info, index) => {
                return (
                  <DraggableCourse
                    key={`${draggingCourseCode}${term}`}
                    planner={planner}
                    courseInfo={info}
                    index={index}
                    time={{ year, term } as CourseTime}
                  />
                );
              })}
              {provided.placeholder}
              <S.UOCBadgeWrapper>
                <Badge
                  style={uocBadgeStyle}
                  size="small"
                  count={`${termUOC} UOC`}
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
