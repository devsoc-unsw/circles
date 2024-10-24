import React from 'react';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'antd';
import { Course } from 'types/api';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';
import useToken from 'hooks/useToken';
import S from './styles';

interface PlannerButtonProps {
  course: Course;
  isAddedInPlanner: boolean;
}

const PlannerButton = ({ course, isAddedInPlanner }: PlannerButtonProps) => {
  const token = useToken();

  const handleMutation = isAddedInPlanner
    ? (code: string) => removeCourse(token, code)
    : (code: string) => addToUnplanned(token, code);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: handleMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses']
      });
      queryClient.invalidateQueries({
        queryKey: ['planner']
      });
      queryClient.invalidateQueries({
        queryKey: ['validate']
      });
    }
  });

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    mutation.mutate(course.code);
  };

  return isAddedInPlanner ? (
    <S.Button loading={mutation.isPending} onClick={handleClick} icon={<StopOutlined />}>
      {!mutation.isPending ? 'Remove from planner' : 'Removing from planner'}
    </S.Button>
  ) : (
    <Button
      loading={mutation.isPending}
      onClick={handleClick}
      icon={<PlusOutlined />}
      type="primary"
    >
      {!mutation.isPending ? 'Add to planner' : 'Adding to planner'}
    </Button>
  );
};

export default PlannerButton;
