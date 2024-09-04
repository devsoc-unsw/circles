import React from 'react';
import { EyeInvisibleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from 'antd';
import { badPlanner, PlannerResponse } from 'types/userResponse';
import { getUserPlanner } from 'utils/api/userApi';
import useNotification from 'hooks/useNotification';
import useSettings from 'hooks/useSettings';
import useToken from 'hooks/useToken';

type Props = {
  year: number;
};

const HideYearTooltip = ({ year }: Props) => {
  const token = useToken();

  const { hiddenYears, hideYear } = useSettings();

  const plannerQuery = useQuery({
    queryKey: ['planner'],
    queryFn: () => getUserPlanner(token)
  });
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;
  const numYears = planner.years.length;

  const notificationHandler = useNotification();

  const handleHideYear = () => {
    if (hiddenYears.length === numYears - 1) {
      notificationHandler.tryOpenNotification({
        name: 'hide-years-notification',
        type: 'error',
        message: "Something's not right",
        description: 'You cannot hide all years in your term planner'
      });
    } else {
      hideYear(year);
    }
  };

  return (
    <Tooltip title="Hide year">
      {/* TODO: Hacky way to have className for YearWrapper styling */}
      <div role="button" className="year-tooltip" onClick={handleHideYear} aria-label="Hide year">
        <EyeInvisibleFilled />
      </div>
    </Tooltip>
  );
};

export default HideYearTooltip;
