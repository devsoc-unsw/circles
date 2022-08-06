import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { DatePicker, Select, Switch } from "antd";
import type { Moment } from "moment";
import moment from "moment";
import { RootState } from "config/store";
import { toggleSummer, updateDegreeLength, updateStartYear } from "reducers/plannerSlice";
import CS from "../common/styles";

const SettingsMenu = () => {
  const { Option } = Select;
  const { isSummerEnabled, numYears, startYear } = useSelector((state: RootState) => state.planner);

  const dispatch = useDispatch();

  function handleUpdateStartYear(_: Moment | null, dateString: string) {
    if (dateString) {
      dispatch(updateStartYear(parseInt(dateString, 10)));
    }
  }

  function handleUpdateDegreeLength(value: number) {
    dispatch(updateDegreeLength(value));
  }

  function handleSummerToggle() {
    dispatch(toggleSummer());
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
        <DatePicker
          onChange={handleUpdateStartYear}
          picker="year"
          style={{ width: 105 }}
          value={moment(startYear, "YYYY")}
        />
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
