/* eslint-disable */
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Course } from 'types/api';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';

interface PlannerButtonProps {
  course: Course;
  planned: boolean;
}

const PlannerButton = ({ course, planned }: PlannerButtonProps) => {
  const courseCode = course.code;
  const handleMutation = planned ? removeCourse : addToUnplanned;

  const queryClient = useQueryClient();
  const mutation = useMutation(handleMutation, {
    onMutate: () => planned,
    onSuccess: async () => {
      // waits until refetch is complete
      await queryClient.invalidateQueries('planner');
    }
  });

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    mutation.mutate(courseCode);
  };

  return planned ? (
    <Button loading={mutation.isLoading} onClick={handleClick} icon={<StopOutlined />}>
      {!mutation.isLoading ? 'Remove from planner' : 'Removing from planner'}
    </Button>
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
