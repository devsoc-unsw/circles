import React, { Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Select, Switch } from 'antd';
import dayjs from 'dayjs';
import openNotification from 'utils/openNotification';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import { toggleSummer, updateDegreeLength, updateStartYear } from 'reducers/plannerSlice';
import CS from '../common/styles';

const DatePicker = React.lazy(() => import('../../../components/Datepicker'));

const SettingsMenu = () => {
  const { Option } = Select;
  const { isSummerEnabled, numYears, startYear } = useSelector((state: RootState) => state.planner);

  const dispatch = useDispatch();

  function handleUpdateStartYear(_: dayjs.Dayjs | null, dateString: string) {
    if (dateString) {
      dispatch(updateStartYear(parseInt(dateString, 10)));
    }
  }

  function handleUpdateDegreeLength(value: number) {
    dispatch(updateDegreeLength(value));
  }

  function handleSummerToggle() {
    dispatch(toggleSummer());
    if (isSummerEnabled) {
      openNotification({
        type: 'info',
        message: 'Your Summer terms are looking a little empty',
        description: 'Courses planned for summer have been unplanned.',
      });
    }
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <CS.MenuPopup>
      <CS.MenuHeader>Settings</CS.MenuHeader>
      <CS.MenuDivider />
      <CS.PopupEntry>
        <CS.MenuText>Summer Term</CS.MenuText>
        <Switch
          defaultChecked={isSummerEnabled}
          onChange={handleSummerToggle}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </CS.PopupEntry>
      <CS.PopupEntry>
        <CS.MenuText>Start Year</CS.MenuText>
        <Suspense fallback={<Spinner text="Loading Year Selector..." />}>
          <DatePicker
            onChange={handleUpdateStartYear}
            picker="year"
            style={{ width: 105 }}
            value={dayjs().year(startYear)}
          />
        </Suspense>
      </CS.PopupEntry>
      <CS.PopupEntry>
        <CS.MenuText>Degree Length</CS.MenuText>
        <Select
          value={numYears}
          style={{ width: 70 }}
          onChange={handleUpdateDegreeLength}
        >
          {years.map((num) => (
            <Option key={num} value={num}>{num}</Option>
          ))}
        </Select>
      </CS.PopupEntry>
    </CS.MenuPopup>
  );
};

export default SettingsMenu;
