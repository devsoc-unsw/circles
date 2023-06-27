/* eslint-disable */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import axios from 'axios';
import { UnselectCourses } from 'types/api';
import prepareUserPayload from 'utils/prepareUserPayload';
import type { RootState } from 'config/store';
import { removeCourses } from 'reducers/plannerSlice';
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
    onSuccess: (data: void, variables: String, context: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["degree"] })
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
        shape="circle"
        icon={<MinusOutlined />}
      />
    </Tooltip>
  );
};

export default QuickAddCartButton;
