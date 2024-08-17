import React, { Suspense } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker, Modal, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import { PlannerResponse } from 'types/userResponse';
import { toggleSummerTerm, updateDegreeLength, updateStartYear } from 'utils/api/userApi';
import openNotification from 'utils/openNotification';
import Spinner from 'components/Spinner';
import useSettings from 'hooks/useSettings';
import useToken from 'hooks/useToken';
import CS from '../common/styles';

type Props = {
  planner?: PlannerResponse;
};

const SettingsMenu = ({ planner }: Props) => {
  const queryClient = useQueryClient();

  const { Option } = Select;
  const { theme } = useSettings();
  const token = useToken();

  function willUnplanCourses(numYears: number) {
    if (!planner) return false;

    if (numYears < planner.years.length) {
      for (let i = numYears; i < planner.years.length; i++) {
        if (Object.values(planner.years[i]).flat().length > 0) return true;
      }
    }

    return false;
  }

  const updateStartYearMutation = useMutation({
    mutationFn: (year: string) => updateStartYear(token, year),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['planner']
      });
    },
    onError: () => {
      openNotification({
        type: 'error',
        message: 'Error setting degree start year',
        description: 'There was an error updating the degree start year.'
      });
    }
  });

  const handleUpdateStartYear = async (_: unknown, dateString: string | string[]) => {
    if (dateString && typeof dateString === 'string') {
      updateStartYearMutation.mutate(dateString);
    } else {
      // eslint-disable-next-line no-console
      console.error('Error updating start year. Invalid date string:', dateString);
    }
  };

  const updateDegreeLengthMutation = useMutation({
    mutationFn: (numYears: number) => updateDegreeLength(token, numYears),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['planner']
      });
    },
    onError: () => {
      openNotification({
        type: 'error',
        message: 'Error setting degree length',
        description: 'There was an error updating the degree length.'
      });
    }
  });

  const handleUpdateDegreeLength = async (value: number) => {
    if (willUnplanCourses(value)) {
      Modal.confirm({
        title: 'Unplanned Courses',
        content:
          'Changing the degree length will unplan courses. Are you sure you want to continue?',
        onOk: () => updateDegreeLengthMutation.mutate(value)
      });
    } else {
      updateDegreeLengthMutation.mutate(value);
    }
  };

  const summerToggleMutation = useMutation({
    mutationFn: () => toggleSummerTerm(token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['planner']
      });

      if (planner && planner.isSummerEnabled) {
        openNotification({
          type: 'info',
          message: 'Your summer term courses have been unplanned',
          description:
            'Courses that were planned during summer terms have been unplanned including courses that have been planned across different terms.'
        });
      }
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at summerToggleMutationMutation: ', err);
      openNotification({
        type: 'error',
        message: 'Error setting summer term',
        description: 'An error occurred when toggling the summer term.'
      });
    }
  });

  const handleSummerToggle = async () => {
    summerToggleMutation.mutate();
  };

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // The settings menu *should* be disabled a layer up if there is no planner
  if (!planner) {
    return null;
  }

  return (
    <CS.MenuPopup>
      <CS.MenuHeader>Settings</CS.MenuHeader>
      <CS.MenuDivider />
      <CS.PopupEntry>
        <CS.MenuText>Summer Term</CS.MenuText>
        <Switch
          defaultChecked={planner.isSummerEnabled}
          onChange={handleSummerToggle}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </CS.PopupEntry>
      <CS.PopupEntry className="settings-start-year-popup">
        <CS.MenuText>Start Year</CS.MenuText>
        <Suspense fallback={<Spinner text="Loading Year Selector..." />}>
          <DatePicker
            onChange={handleUpdateStartYear}
            picker="year"
            style={{ width: 105 }}
            value={dayjs().year(planner.startYear)}
            minDate={dayjs('2019')}
            maxDate={dayjs().add(7, 'year')}
          />
        </Suspense>
      </CS.PopupEntry>
      <CS.PopupEntry className="settings-degree-length-popup">
        <CS.MenuText>Degree Length</CS.MenuText>
        <Select
          value={planner.years.length}
          style={{ width: 70 }}
          dropdownStyle={{
            backgroundColor: theme === 'light' ? '#fff' : '#444249',
            color: theme === 'light' ? '#444249' : '#fff'
          }}
          onChange={handleUpdateDegreeLength}
          className="settings-degree-length-popup"
        >
          {years.map((num) => (
            <Option key={num} value={num} className="settings-degree-length-popup">
              {num}
            </Option>
          ))}
        </Select>
      </CS.PopupEntry>
    </CS.MenuPopup>
  );
};

export default SettingsMenu;
