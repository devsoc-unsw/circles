import React, { useEffect } from "react";
import { updateDegreeLength } from "../../actions/userAction";
import { plannerActions } from "../../actions/plannerActions";
import {
  Typography,
  Drawer,
  Collapse,
  Alert,
  DatePicker,
  Select,
  Switch,
  Divider,
  Modal,
  Button,
} from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { IoCogSharp } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { SettingFilled } from "@ant-design/icons";
import { RiContactsBookUploadLine } from "react-icons/ri";

const SettingsMenu = () => {
  const { Title } = Typography;
  const { Panel } = Collapse;
  const { Option } = Select;
  const theme = useSelector((state) => state.theme);
  const { courses, unplanned, isSummerEnabled, startYear, numYears } =
    useSelector((state) => {
      return state.planner;
    });

  const dispatch = useDispatch();

  function updateStartYear(date, dateString) {
    dispatch(plannerActions("SET_START_YEAR", dateString));
  }

  function updateDegreeLength(value) {
    dispatch(plannerActions("SET_DEGREE_LENGTH", value));
  }

  function handleSummerToggle() {
    dispatch(plannerActions("TOGGLE_SUMMER"));
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="settingsMenu">
      <div className="settingsTitleContainer">
        <Title level={2} class="text" strong className="settingsTitle">
          Settings
        </Title>
        <Divider className="settingsDivider" />
      </div>
      <div className="settingsEntry">
        <Title level={3} class="text settingsSubtitle">
          Summer Term
        </Title>
        <Switch
          defaultChecked={isSummerEnabled}
          onChange={handleSummerToggle}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </div>
      <div className="settingsEntry">
        <Title level={3} class="text settingsSubtitle">
          Start Year
        </Title>
        <DatePicker
          onChange={updateStartYear}
          picker="year"
          style={{ width: 105 }}
        />
      </div>
      <div className="settingsEntry">
        <Title level={3} class="text settingsSubtitle">
          Degree Length
        </Title>
        <Select
          defaultValue="3"
          style={{ width: 70 }}
          onChange={updateDegreeLength}
        >
          {years.map((num) => (
            <Option value={num}>{num}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default SettingsMenu;
