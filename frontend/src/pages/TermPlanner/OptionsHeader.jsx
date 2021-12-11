import React from "react";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";
import { IoCogSharp } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import SettingsMenu from "./SettingsMenu";
import SaveMenu from "./SaveMenu";
import { IoIosEye } from "react-icons/io";
import { TiDownload } from "react-icons/ti";

const OptionsHeader = ({ areYearsHidden, unhideAll, plannerRef }) => {
  const theme = useSelector((state) => state.theme);
  return (
    <div className="optionsHeader">
      <Tippy
        content={<SettingsMenu />}
        moveTransition="transform 0.2s ease-out"
        interactive={true}
        trigger="click"
        theme={theme === "light" ? "light" : "dark"}
        zIndex={1}
        placement="bottom-start"
      >
        <button className="settingsButton">
          <IoCogSharp
            className="settingsIcon"
            size="1.5em"
            style={{
              color: theme === "light" ? "#303539" : "white",
            }}
          />
        </button>
      </Tippy>
          
      { theme === "light" && 
      <Tippy
        content={<SaveMenu plannerRef={plannerRef} />}
        moveTransition="transform 0.2s ease-out"
        interactive={true}
        trigger="click"
        theme={theme === "light" ? "light" : "dark"}
        zIndex={1}
        placement="bottom-start"
      >
        <button className="settingsButton">
          <TiDownload
            className="settingsIcon"
            size="1.5em"
            style={{
              color: theme === "light" ? "#303539" : "white",
            }}
          />
        </button>
      </Tippy>
      }

    </div>
  );
};

export default OptionsHeader;
