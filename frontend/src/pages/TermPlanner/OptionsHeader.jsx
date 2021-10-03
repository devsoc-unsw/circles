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
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { IoIosEye } from "react-icons/io";

const OptionsHeader = ({ areYearsHidden, unhideAll }) => {
  const theme = useSelector((state) => state.theme);

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="optionsHeader">
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
            className="settingsIcon"
            size="1.5em"
            style={{
              color: theme === "light" ? "#303539" : "#3b3e3e",
            }}
          />
        </button>
      </Tippy>

      {areYearsHidden && (
        <button className="settingsButton " onClick={unhideAll}>
          <IoIosEye size="1.5em" className="settingsIcon" />
        </button>
      )}
    </div>
  );
};

export default OptionsHeader;
