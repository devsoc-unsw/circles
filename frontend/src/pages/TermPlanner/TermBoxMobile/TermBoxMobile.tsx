import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Course } from 'types/api';
import type { Term } from 'types/planner';
import type { PlannerResponse, ValidatesResponse } from 'types/userResponse';
import { getTermsList } from 'utils/termsPerYear';
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

  const termsForYearIndex = (yIdx: number): Term[] =>
    getTermsList(planner.startYear + yIdx, planner.isSummerEnabled);

  const terms = termsForYearIndex(yearIndex);
  const clampedTermIndex = Math.min(termIndex, terms.length - 1);

  const currentYear = planner.startYear + yearIndex;
  const currentTerm = terms[clampedTermIndex];
  const currentTermLabel = currentTerm === 'T0' ? 'Summer' : `Term ${currentTerm[1]}`;
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
      setTermIndex(termsForYearIndex(yearIndex - 1).length - 1);
    }
  };

  const termCourses = planner.years[yearIndex][currentTerm] || [];
  const termCourseInfos = Object.fromEntries(
    termCourses.map((code) => [code, courseInfos[currentYear]?.[code]])
  );

  const isFirstTerm = yearIndex === 0 && clampedTermIndex === 0;
  const isLastTerm =
    yearIndex === planner.years.length - 1 && clampedTermIndex === terms.length - 1;

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
        Term{' '}
        {planner.years.reduce(
          (acc, _, yIdx) => (yIdx < yearIndex ? acc + termsForYearIndex(yIdx).length : acc),
          clampedTermIndex + 1
        )}{' '}
        of {planner.years.reduce((acc, _, yIdx) => acc + termsForYearIndex(yIdx).length, 0)}
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
