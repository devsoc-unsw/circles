import React, { Suspense } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Select, Switch } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { PlannerResponse } from 'types/userResponse';
import openNotification from 'utils/openNotification';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import CS from '../common/styles';

const DatePicker = React.lazy(() => import('components/Datepicker'));

type Props = {
  planner?: PlannerResponse;
};

const SettingsMenu = ({ planner }: Props) => {
  const queryClient = useQueryClient();

  const { Option } = Select;
  const { token, theme } = useSelector((state: RootState) => state.settings);

  async function handleUpdateStartYear(_: unknown, dateString: string | string[]) {
    if (dateString && typeof dateString === 'string') {
      try {
        await axios.put(
          '/user/updateStartYear',
          { startYear: parseInt(dateString, 10) },
          { params: { token } }
        );
      } catch {
        openNotification({
          type: 'error',
          message: 'Error setting degree start year',
          description: 'There was an error updating the degree start year.'
        });
      }
    }
  }

  async function handleUpdateDegreeLength(value: number) {
    try {
      await axios.put('/user/updateDegreeLength', { numYears: value }, { params: { token } });
    } catch {
      openNotification({
        type: 'error',
        message: 'Error setting degree length',
        description: 'There was an error updating the degree length.'
      });
    }
  }

  async function summerToggle() {
    try {
      await axios.post('/user/toggleSummerTerm', {}, { params: { token } });
    } catch {
      openNotification({
        type: 'error',
        message: 'Error setting summer term',
        description: 'An error occurred when toggling the summer term.'
      });
      return;
    }
    if (planner && planner.isSummerEnabled) {
      openNotification({
        type: 'info',
        message: 'Your summer term courses have been unplanned',
        description:
          'Courses that were planned during summer terms have been unplanned including courses that have been planned across different terms.'
      });
    }
  }

  const summerToggleMutation = useMutation(summerToggle, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at summerToggleMutationMutation: ', err);
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
