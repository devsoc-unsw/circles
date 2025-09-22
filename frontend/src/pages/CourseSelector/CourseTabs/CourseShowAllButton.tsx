import React from 'react';
import { Switch } from 'antd';
import useSettings from 'hooks/useSettings';
import S from './styles';

const CourseShowAllButton = () => {
  const { showLockedCourses, toggleLockedCourses } = useSettings();
  return (
    <S.ShowAllCourses>
      <S.TextShowCourses>Show all</S.TextShowCourses>
      <Switch
        size="small"
        data-testid="show-all-courses"
        defaultChecked={showLockedCourses}
        onChange={() => toggleLockedCourses()}
      />
    </S.ShowAllCourses>
  );
};

export default CourseShowAllButton;
