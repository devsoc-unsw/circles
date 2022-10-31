/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LockFilled, UnlockFilled } from '@ant-design/icons';
import { Badge } from 'antd';
import { useTheme } from 'styled-components';
import { Term } from 'types/planner';
import { courseHasOffering, CourseOfferings } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import { toggleTermComplete } from 'reducers/plannerSlice';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

type Props = {
  name: string;
  coursesList: string[];
  courseOfferings: CourseOfferings;
  draggingCourse: string | undefined;
};

const TermBox = ({ name, coursesList, courseOfferings, draggingCourse }: Props) => {
  const year = name.slice(0, 4);
  const term = name.match(/T[0-3]/)?.[0] as string;
  const theme = useTheme();

  const { isSummerEnabled, completedTerms, courses } = useSelector(
    (state: RootState) => state.planner
  );
  const [totalUOC, setTotalUOC] = useState(0);
  const dispatch = useDispatch();
  const handleCompleteTerm = () => {
    dispatch(toggleTermComplete(name));
  };

  useEffect(() => {
    let uoc = 0;
    Object.keys(courses).forEach((c) => {
      if (coursesList.includes(c)) uoc += courses[c].UOC;
    });
    setTotalUOC(uoc);
  }, [courses, coursesList]);

  const isCompleted = !!completedTerms[name];

  const offeredInTerm =
    !!draggingCourse && courseHasOffering(draggingCourse, year, term, courseOfferings);
  const isOffered = offeredInTerm && !isCompleted;

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
      <Droppable droppableId={name} isDropDisabled={isCompleted}>
        {(provided) => (
          <Badge
            count={
              <S.TermCheckboxWrapper checked={isCompleted}>
                {
                  !isCompleted ? (
                    <UnlockFilled style={iconStyle} onClick={handleCompleteTerm} />
                  ) : (
                    <LockFilled style={iconStyle} onClick={handleCompleteTerm} />
                  ) //
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
              {coursesList.map((code, index) => (
                <DraggableCourse
                  key={`${code}${term}`}
                  code={code}
                  index={index}
                  term={term}
                  courseOfferings={courseOfferings}
                />
              ))}
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
