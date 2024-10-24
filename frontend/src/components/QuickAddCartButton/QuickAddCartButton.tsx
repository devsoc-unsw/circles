import React from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tooltip } from 'antd';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';
import useSettings from 'hooks/useSettings';
import useToken from 'hooks/useToken';
import S from './styles';

type Props = {
  courseCode: string;
  runMutate?: (courseId: string) => void;
  planned?: boolean;
};

const QuickAddCartButton = ({ courseCode, runMutate, planned }: Props) => {
  const token = useToken();

  const handleMutation = planned
    ? (code: string) => removeCourse(token, code)
    : (code: string) => addToUnplanned(token, code);

  const { theme } = useSettings();
  const iconStyles = {
    color: theme === 'light' ? '#000' : '#fff'
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: handleMutation,
    onMutate: () => planned,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['planner']
      });
    }
  });

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (runMutate) runMutate(courseCode);
    else mutation.mutate(courseCode);
  };

  return !planned ? (
    <Tooltip title="Add to Planner" placement="top">
      <S.SelectButton
        data-testid="quick-add-cart-button"
        onClick={handleClick}
        size="small"
        loading={mutation.isPending}
        shape="circle"
        icon={<PlusOutlined style={iconStyles} />}
      />
    </Tooltip>
  ) : (
    <Tooltip title="Remove from Planner" placement="top">
      <S.DeselectButton
        data-testid="quick-remove-cart-button"
        onClick={handleClick}
        size="small"
        loading={mutation.isPending}
        shape="circle"
        icon={<MinusOutlined style={iconStyles} />}
      />
    </Tooltip>
  );
};

export default QuickAddCartButton;
