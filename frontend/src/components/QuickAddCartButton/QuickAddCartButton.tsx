import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';
import S from './styles';

type Props = {
  courseCode: string;
  planned?: boolean;
};

const QuickAddCartButton = ({ courseCode, planned }: Props) => {
  const handleMutation = planned ? removeCourse : addToUnplanned;

  const queryClient = useQueryClient();
  const mutation = useMutation(handleMutation, {
    onMutate: () => planned,
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
      queryClient.invalidateQueries('courses');
    }
  });

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    mutation.mutate(courseCode);
  };

  return !planned ? (
    <Tooltip title="Add to Planner" placement="top">
      <Button
        data-testid="quick-add-cart-button"
        onClick={handleClick}
        size="small"
        loading={mutation.isLoading}
        shape="circle"
        icon={<PlusOutlined />}
      />
    </Tooltip>
  ) : (
    <Tooltip title="Remove from Planner" placement="top">
      <S.DeselectButton
        data-testid="quick-remove-cart-button"
        onClick={handleClick}
        size="small"
        loading={mutation.isLoading}
        shape="circle"
        icon={<MinusOutlined />}
      />
    </Tooltip>
  );
};

export default QuickAddCartButton;
