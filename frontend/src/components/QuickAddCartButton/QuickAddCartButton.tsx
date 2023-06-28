/* eslint-disable */
import React from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import S from './styles';
import { useMutation, useQueryClient } from 'react-query';
import { handleAddToUnplanned, handleRemoveCourse } from 'utils/api/plannerApi';

type Props = {
  courseCode: string;
  planned?: boolean;
};

const QuickAddCartButton = ({ courseCode, planned }: Props) => {

  const handleMutation = planned ? handleRemoveCourse : handleAddToUnplanned;

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: handleMutation,
    onMutate: () => planned,
    onSuccess: async (data: void, variables: String, context: unknown) => {
      // waits until refetch is complete
      await queryClient.invalidateQueries({ queryKey: ["everything"] })
    }
  });

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    mutation.mutate(courseCode);
  }

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
