import React from "react";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";
import { IoCogSharp } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import SettingsMenu from "./SettingsMenu";
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
        <Tooltip title="Show all hidden years">
          <button className="settingsButton " onClick={unhideAll}>
            <IoIosEye size="1.5em" className="settingsIcon" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default OptionsHeader;
