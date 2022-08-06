import React from 'react';
import { useDispatch } from 'react-redux';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';

type Props = {
  name: string
};

const CourseTag = ({ name }: Props) => {
  const dispatch = useDispatch();

  return (
    <S.Tag onClick={() => dispatch(addTab(name))} className="text">
      {name}
    </S.Tag>
  );
};

export default CourseTag;
