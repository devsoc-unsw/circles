import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  DatePicker, Select, Switch, Typography,
} from "antd";
import moment from "moment";
import { toggleSummer, updateDegreeLength, updateStartYear } from "reducers/plannerSlice";
import CS from "../common/styles";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const SettingsMenu = () => {
  const { Title } = Typography;
  const { Option } = Select;
  const { isSummerEnabled, numYears, startYear } = useSelector((state) => state.planner);

  const dispatch = useDispatch();

  function handleUpdateStartYear(date, dateString) {
    if (dateString) {
      dispatch(updateStartYear(dateString));
    }
  }

  function handleUpdateDegreeLength(value) {
    dispatch(updateDegreeLength(value));
  }

  function handleSummerToggle() {
    dispatch(toggleSummer());
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <CS.MenuPopup>
      <Title level={2} strong className="text settingsTitle">
        Settings
      </Title>
      <CS.MenuDivider />
      <CS.PopupEntry>
        <Title level={3} className="text settingsSubtitle">
          Summer Term
        </Title>
        <Switch
          defaultChecked={isSummerEnabled}
          onChange={handleSummerToggle}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </CS.PopupEntry>
      <CS.PopupEntry>
        <Title level={3} className="text settingsSubtitle">
          Start Year
        </Title>
        <DatePicker
          onChange={handleUpdateStartYear}
          picker="year"
          style={{ width: 105 }}
          value={moment(startYear, "YYYY")}
        />
      </CS.PopupEntry>
      <CS.PopupEntry>
        <Title level={3} className="text settingsSubtitle">
          Degree Length
        </Title>
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
