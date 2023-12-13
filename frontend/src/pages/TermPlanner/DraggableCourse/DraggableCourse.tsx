import React, { Suspense } from 'react';
import { useContextMenu } from 'react-contexify';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { useTheme } from 'styled-components';
import { Course } from 'types/api';
import { CourseTime } from 'types/courses';
import { CoursesResponse, PlannerResponse, ValidateResponse } from 'types/userResponse';
import { courseHasOfferingNew } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import ContextMenu from '../ContextMenu';
import S from './styles';

type Props = {
  planner: PlannerResponse;
  courses: CoursesResponse;
  validate?: ValidateResponse;
  courseInfo: Course;
  index: number;
  time?: CourseTime;
};

const Draggable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Draggable }))
);

const DraggableCourse = ({ planner, validate, courses, courseInfo, index, time }: Props) => {
  const { isSummerEnabled } = planner;
  const { showMarks } = useSelector((state: RootState) => state.settings);
  const theme = useTheme();
  const { Text } = Typography;

  // prereqs are populated in CourseDescription.jsx via course.raw_requirements
  const { title, code } = courseInfo;
  // TODO: Change the backend so that naming is universally in camelCase so we don't have to do this
  const { is_legacy: isLegacy, handbook_note: handbookNote } = courseInfo;
  const {
    suppressed,
    is_accurate: isAccurate,
    unlocked: isUnlocked,
    warnings: warningMessage
  } = validate || {
    suppressed: true,
    is_accurate: true,
    warnings: [],
    unlocked: true,
    handbook_note: ''
  };

  const showNotOfferedWarning = time ? courseHasOfferingNew(courseInfo, time.term) : true;

  const contextMenu = useContextMenu({
    id: `${code}-context`
  });

  const BEwarnings = handbookNote || warningMessage.length !== 0;

  const isTermLocked = time ? planner.lockedTerms[`${time.year}${time.term}`] ?? false : false;

  const isSmall = useMediaQuery('(max-width: 1400px)');
  // TODO: Fix these boolean checks for warnings
  const shouldHaveWarning =
    !suppressed && (isLegacy || !isUnlocked || BEwarnings || !isAccurate || !showNotOfferedWarning);
  const errorIsInformational =
    shouldHaveWarning &&
    isUnlocked &&
    warningMessage.length === 0 &&
    !isLegacy &&
    isAccurate &&
    showNotOfferedWarning;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isTermLocked) contextMenu.show({ event: e });
  };

  const stripExtraParenthesis = (warning: string): string => {
    if (warning[0] !== '(' || warning[warning.length - 1] !== ')') {
      return warning;
    }
    let openParenCount = 0;
    // If first open brace is ever fully closed, we don't want to strip them out
    for (let i = 0; i < warning.length - 1; i += 1) {
      if (warning[i] === '(') {
        openParenCount += 1;
      } else if (warning[i] === ')') {
        openParenCount -= 1;
      }
      if (openParenCount <= 0) {
        return warning;
      }
    }
    return stripExtraParenthesis(warning.slice(1, warning.length - 1));
  };

  return (
    <>
      <Suspense fallback={<Spinner text="Loading Course..." />}>
        <Draggable
          isDragDisabled={isTermLocked}
          draggableId={`${courseInfo.code}${time?.term ?? 'unplanned'}`}
          index={index}
        >
          {(provided) => (
            <S.CourseWrapper
              summerEnabled={isSummerEnabled}
              isSmall={isSmall}
              dragDisabled={isTermLocked}
              warningsDisabled={isTermLocked && !isUnlocked}
              isWarning={!suppressed && (!isUnlocked || !showNotOfferedWarning)}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              style={provided.draggableProps.style}
              data-tip
              data-for={courseInfo.code}
              id={courseInfo.code}
              onContextMenu={handleContextMenu}
            >
              {!isTermLocked &&
                shouldHaveWarning &&
                (errorIsInformational ? (
                  <InfoCircleOutlined style={{ color: theme.infoOutlined.color }} />
                ) : (
                  <WarningOutlined
                    style={{ fontSize: '16px', color: theme.warningOutlined.color }}
                  />
                ))}
              <S.CourseLabel>
                {isSmall ? (
                  <Text className="text">{courseInfo.code}</Text>
                ) : (
                  <div>
                    <Text className="text">
                      <strong>{courseInfo.code}: </strong>
                      {title}
                    </Text>
                  </div>
                )}
                {showMarks && (
                  <div>
                    <Text strong className="text">
                      Mark:&nbsp;
                    </Text>
                    <Text className="text">
                      {/*
                          Marks can be strings (i.e. HD, CR) or a number (i.e. 90, 85).
                          Mark can be 0.
                        */}
                      {courses[courseInfo.code].mark !== null
                        ? courses[courseInfo.code].mark
                        : 'N/A'}
                    </Text>
                  </div>
                )}
              </S.CourseLabel>
            </S.CourseWrapper>
          )}
        </Draggable>
      </Suspense>
      <ContextMenu code={courseInfo.code} scheduled={!!time} />
      {/* display prereq tooltip for all courses. However, if a term is marked as complete
        and the course has no warning, then disable the tooltip */}
      {isSmall && (
        <ReactTooltip id={courseInfo.code} place="top" effect="solid">
          {title}
        </ReactTooltip>
      )}
      {!isTermLocked && shouldHaveWarning && (
        <ReactTooltip id={courseInfo.code} place="bottom">
          {isLegacy ? (
            'This course is discontinued. If an equivalent course is currently being offered, please pick that instead.'
          ) : !showNotOfferedWarning ? (
            'The course is not offered in this term.'
          ) : warningMessage.length !== 0 ? (
            stripExtraParenthesis(warningMessage.join('\n'))
          ) : (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: handbookNote }} />
          )}
          {!isAccurate ? ' The course info may be inaccurate.' : ''}
        </ReactTooltip>
      )}
    </>
  );
};

export default DraggableCourse;
