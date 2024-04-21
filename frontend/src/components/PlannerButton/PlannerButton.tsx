import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Course } from 'types/api';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';
import S from './styles';

interface PlannerButtonProps {
  course: Course;
  isAddedInPlanner: boolean;
}

const PlannerButton = ({ course, isAddedInPlanner }: PlannerButtonProps) => {
  const handleMutation = isAddedInPlanner ? removeCourse : addToUnplanned;
  const queryClient = useQueryClient();
  const mutation = useMutation(handleMutation, {
    onSuccess: () => {
      queryClient.invalidateQueries('courses');
      queryClient.invalidateQueries('planner');
    }
  });
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    mutation.mutate(course.code);
  };
  return isAddedInPlanner ? (
    <S.Button loading={mutation.isLoading} onClick={handleClick} icon={<StopOutlined />}>
      {!mutation.isLoading ? 'Remove from planner' : 'Removing from planner'}
    </S.Button>
  ) : (
    <Button
      loading={mutation.isLoading}
      onClick={handleClick}
      icon={<PlusOutlined />}
      type="primary"
    >
      {!mutation.isLoading ? 'Add to planner' : 'Adding to planner'}
    </Button>
  );
};

export default PlannerButton;
