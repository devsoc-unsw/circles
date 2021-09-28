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
    // if (dateString + numYears > startYear) {
    //   setVisible(true);
    //   let years = "";
    //   for (let i = dateString; i < startYear + numYears; i++) {
    //     if (i > startYear) years += ` ${i}`;
    //   }
    //   console.log(years);
    // } else
    dispatch(plannerActions("SET_START_YEAR", dateString));
  }

  function handleChange(value) {
    dispatch(updateDegreeLength(value));
  }

  function handleSummerToggle() {
    dispatch(plannerActions("TOGGLE_SUMMER"));
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  //   const handleOk = () => {};

  //   const handleCancel = () => {
  //     setVisible(false);
  //   };

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
        <Select defaultValue="3" style={{ width: 70 }} onChange={handleChange}>
          {years.map((num) => (
            <Option value={num}>{num}</Option>
          ))}
        </Select>
      </div>
      {/* <Modal
        visible={visible}
        title="⚠️  Are you sure?"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Confirm
          </Button>,
        ]}
      >
        <p>The years will be removed</p>
        <p>All courses in this year will be unscheduled.</p>
      </Modal> */}
    </div>
  );
};

export default SettingsMenu;
