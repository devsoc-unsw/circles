import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { addToUnplanned, removeCourse } from 'utils/api/plannerApi';
import { RootState } from 'config/store';
import S from './styles';

type Props = {
  courseCode: string;
  runMutate?: (courseId: string) => void;
  planned?: boolean;
};

const QuickAddCartButton = ({ courseCode, runMutate, planned }: Props) => {
  const handleMutation = planned ? removeCourse : addToUnplanned;

  const { theme } = useSelector((state: RootState) => state.settings);
  const iconStyles = {
    color: theme === 'light' ? '#000' : '#fff'
  };
  const queryClient = useQueryClient();
  const mutation = useMutation(handleMutation, {
    onMutate: () => planned,
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    onSuccess: async (data: void, variables: string, context: unknown) => {
      await queryClient.invalidateQueries('planner');
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
        loading={mutation.isLoading}
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
        loading={mutation.isLoading}
        shape="circle"
        icon={<MinusOutlined style={iconStyles} />}
      />
    </Tooltip>
  );
};

export default QuickAddCartButton;
