import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EyeInvisibleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import openNotification from 'utils/openNotification';
import type { RootState } from 'config/store';
import { hideYear } from 'reducers/plannerSlice';

type Props = {
  year: number
};

const HideYearTooltip = ({ year }: Props) => {
  const { hidden, numYears } = useSelector((state: RootState) => state.planner);
  const dispatch = useDispatch();

  const handleHideYear = () => {
    const numHidden = Object.values(hidden).filter((h) => h).length;
    if (numHidden === numYears - 1) {
      openNotification({
        type: 'error',
        message: 'Something\'s not right',
        description: 'You cannot hide all years in your term planner',
      });
    } else {
      dispatch(hideYear(year));
    }
  };

  return (
    <Tooltip title="Hide year">
      {/* TODO: Hacky way to have className for YearWrapper styling */}
      <div role="button" className="year-tooltip" onClick={handleHideYear}>
        <EyeInvisibleFilled />
      </div>
    </Tooltip>
  );
};

export default HideYearTooltip;
