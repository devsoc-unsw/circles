import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Course } from 'types/api';
import type { Term } from 'types/planner';
import type { PlannerResponse, ValidatesResponse } from 'types/userResponse';
import { LIVE_YEAR } from 'config/constants';
import TermBox from '../TermBox';
import UnplannedColumn from '../UnplannedColumn';
import * as S from './styles';

type YearToCoursesMap = { [year: number]: { [code: string]: Course } };

interface MobilePlannerViewProps {
  planner: PlannerResponse;
  courseInfos: YearToCoursesMap;
  validations: ValidatesResponse;
  draggingCourseCode?: string;
  validYears: number[];
}

const TermBoxMobile: React.FC<MobilePlannerViewProps> = ({
  planner,
  courseInfos,
  validations,
  draggingCourseCode,
  validYears
}) => {
  const [yearIndex, setYearIndex] = useState(0);
  const [termIndex, setTermIndex] = useState(0);

  const terms = planner.isSummerEnabled ? ['T0', 'T1', 'T2', 'T3'] : ['T1', 'T2', 'T3'];
  const termLabels = planner.isSummerEnabled
    ? ['Summer', 'Term 1', 'Term 2', 'Term 3']
    : ['Term 1', 'Term 2', 'Term 3'];

  const currentYear = planner.startYear + yearIndex;
  const currentTerm = terms[termIndex] as Term;
  const currentTermLabel = termLabels[termIndex];
  const termKey = `${currentYear}${currentTerm}`;

  const handleNext = () => {
    if (termIndex < terms.length - 1) {
      setTermIndex(termIndex + 1);
    } else if (yearIndex < planner.years.length - 1) {
      setYearIndex(yearIndex + 1);
      setTermIndex(0);
    }
  };

  const handlePrev = () => {
    if (termIndex > 0) {
      setTermIndex(termIndex - 1);
    } else if (yearIndex > 0) {
      setYearIndex(yearIndex - 1);
      setTermIndex(terms.length - 1);
    }
  };

  const termCourses = planner.years[yearIndex][currentTerm] || [];
  const termCourseInfos = Object.fromEntries(
    termCourses.map((code) => [code, courseInfos[currentYear]?.[code]])
  );

  const isFirstTerm = yearIndex === 0 && termIndex === 0;
  const isLastTerm = yearIndex === planner.years.length - 1 && termIndex === terms.length - 1;

  const termUOC = termCourses.reduce((acc, code) => {
    const course = termCourseInfos[code];
    return acc + (course ? course.UOC : 0);
  }, 0);

  return (
    <S.Container>
      <S.Header>
        <S.YearTitle>{currentYear}</S.YearTitle>
        <S.TermLabel>{currentTermLabel}</S.TermLabel>
        <S.TermUOC>{termUOC} UOC</S.TermUOC>
      </S.Header>

      <S.NavigationWrapper>
        <S.NavButton onClick={handlePrev} disabled={isFirstTerm} icon={<LeftOutlined />}>
          Previous
        </S.NavButton>
        <S.NavButton
          onClick={handleNext}
          disabled={isLastTerm}
          icon={<RightOutlined />}
          iconPosition="end"
        >
          Next
        </S.NavButton>
      </S.NavigationWrapper>

      <S.QuickJumpWrapper>
        <S.QuickJumpTitle>Quick Jump:</S.QuickJumpTitle>
        <S.QuickJumpButtons>
          {planner.years.map((_, yIdx) => {
            const year = planner.startYear + yIdx;
            return (
              <S.NavButton
                key={year}
                size="small"
                type={yIdx === yearIndex ? 'primary' : 'default'}
                onClick={() => {
                  setYearIndex(yIdx);
                  setTermIndex(0);
                }}
              >
                {year}
              </S.NavButton>
            );
          })}
        </S.QuickJumpButtons>
      </S.QuickJumpWrapper>

      <S.ProgressIndicator>
        Term {yearIndex * terms.length + termIndex + 1} of {planner.years.length * terms.length}
      </S.ProgressIndicator>

      <S.TermUnplannedWrapper>
        <TermBox
          key={termKey}
          name={termKey}
          courseInfos={courseInfos[currentYear] || {}}
          validateInfos={validations.courses_state || {}}
          termCourseInfos={termCourseInfos}
          termCourseCodes={termCourses}
          draggingCourseCode={draggingCourseCode}
        />
        <S.MobileUnplannedWrapper>
          <UnplannedColumn
            key={`unplanned-${currentYear}`}
            dragging={!!draggingCourseCode}
            courseInfos={Object.fromEntries(
              planner.unplanned.map((code) => [
                code,
                courseInfos[validYears.includes(LIVE_YEAR) ? LIVE_YEAR : validYears.at(-1)!][code]
              ])
            )}
            validateInfos={validations.courses_state}
          />
        </S.MobileUnplannedWrapper>
      </S.TermUnplannedWrapper>
    </S.Container>
  );
};

export default TermBoxMobile;
