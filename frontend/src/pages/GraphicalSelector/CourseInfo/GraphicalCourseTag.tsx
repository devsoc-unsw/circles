import React, { MouseEventHandler } from 'react';
import S from './styles';

type Props = {
  name: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
};

const CourseTag = ({ name, onClick }: Props) => (
  (onClick !== undefined)
    ? <S.Tag className="text clickable" onClick={onClick}>{name}</S.Tag>
    : <S.Tag className="text">{name}</S.Tag>
);

export default CourseTag;
