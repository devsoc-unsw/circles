import React from 'react';
import { useNavigate } from 'react-router-dom';
import S from './styles';

type Props = {
  courseCode: string;
  title: string;
  planned?: boolean;
};

const CourseButton = ({ courseCode, title, planned }: Props) => {
  const navigate = useNavigate();

  const handleCourseLink = (e: React.MouseEvent<HTMLElement>): void => {
    e.stopPropagation();
    navigate('/course-selector');
  };

  return (
    <S.CourseButton planned={planned} type="primary" onClick={handleCourseLink}>
      {courseCode}: {title}
    </S.CourseButton>
  );
};

export default CourseButton;
