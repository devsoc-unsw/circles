import React from 'react';
import S from './styles';

type Props = {
  name: string;
  onCourseClick?: (code: string) => void;
};

const CourseTag = ({ name, onCourseClick }: Props) => {
  return (
    <S.Tag onClick={() => onCourseClick && onCourseClick(name)} className="text">
      {name}
    </S.Tag>
  );
};

export default CourseTag;
