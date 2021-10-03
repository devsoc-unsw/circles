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
import { IoCogSharp } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { SettingFilled } from "@ant-design/icons";
import SettingsMenu from "./SettingsMenu";

const SettingsButton = ({ visible, setVisible }) => {
  const theme = useSelector((state) => state.theme);

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Tippy
      content={<SettingsMenu />}
      moveTransition="transform 0.2s ease-out"
      interactive={true}
      hideOnClick="toggle"
      trigger="click"
      theme={theme === "light" && "light"}
      zIndex={1}
      placement="bottom-start"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`settingsButton ${isOpen && "clicked"}`}
      >
        <IoCogSharp
          size="1.2em"
          style={{ fontSize: "1.5em", color: "#303539" }}
        />
      </button>
    </Tippy>
  );
};

export default SettingsButton;
