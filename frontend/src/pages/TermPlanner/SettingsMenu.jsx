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
} from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { SettingOutlined } from "@ant-design/icons";

const SettingsMenu = ({ visible, setVisible }) => {
  const { Title } = Typography;
  const { Panel } = Collapse;
  const { Option } = Select;
  const theme = useSelector((state) => state.theme);
  const { courses, unplanned, isSummerEnabled } = useSelector((state) => {
    return state.planner;
  });

  const dispatch = useDispatch();
  const sortedUnplanned = sortUnplanned(unplanned, courses);

  function onChange(date, dateString) {
    console.log(date, dateString);
  }

  function handleChange(value) {
    dispatch(updateDegreeLength(value));
  }

  function handleSummerToggle() {
    dispatch(plannerActions("TOGGLE_SUMMER"));
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div
      style={{
        padding: "1em",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.5em",
      }}
    >
      <div style={{ width: "14em" }}>
        <Title
          level={2}
          class="text"
          strong
          style={{ marginBottom: "0em", textAlign: "left" }}
        >
          Settings
        </Title>
        <Divider style={{ marginTop: "0.5em", marginBottom: "0.5em" }} />
      </div>
      <div className="summerToggleBox">
        <Title level={3} class="text" style={{ marginBottom: "0em" }}>
          Summer Term
        </Title>
        <Switch
          defaultChecked={isSummerEnabled}
          onChange={handleSummerToggle}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </div>
      <div className="summerToggleBox">
        <Title level={3} class="text" style={{ marginBottom: "0em" }}>
          Start Year
        </Title>
        <DatePicker onChange={onChange} picker="year" style={{ width: 105 }} />
      </div>

      <div className="summerToggleBox">
        <Title level={3} class="text" style={{ marginBottom: "0em" }}>
          Degree Length
        </Title>
        <Select defaultValue="3" style={{ width: 70 }} onChange={handleChange}>
          {years.map((num) => (
            <Option value={num}>{num}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }
const sortUnplanned = (unplanned, courses) => {
  if (unplanned == null) return {};
  let courseTypes = {};
  unplanned.forEach((code) => {
    const type = courses.get(code)["type"];
    if (!courseTypes.hasOwnProperty(type)) {
      courseTypes[type] = [code];
    } else {
      courseTypes[type].push(code);
    }
  });
  return courseTypes;
};

export default SettingsMenu;
