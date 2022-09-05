import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import QuickAddCartButton from 'components/QuickAddCartButton';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';

type Props = {
  courseCode: string
  title: string
  planned: boolean
};

const CourseCard = ({ courseCode, title, planned }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCourseLink = (e: React.MouseEvent<HTMLElement>): void => {
    e.stopPropagation();
    navigate('/course-selector');
    dispatch(addTab(courseCode));
  };

  return (
    <S.CourseCard
      planned={planned}
      type="primary"
      onClick={handleCourseLink}
    >
      <S.CourseWrapper>
        <S.CourseCode>{courseCode}</S.CourseCode>
        <S.CourseTitle>{title}</S.CourseTitle>
      </S.CourseWrapper>
      <S.QuickCartButton>
        <QuickAddCartButton courseCode={courseCode} planned={planned} />
      </S.QuickCartButton>
    </S.CourseCard>
  );
};

export default CourseCard;
