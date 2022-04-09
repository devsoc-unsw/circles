import React from "react";
import { Tooltip, Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { IoCogSharp } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { FaRegCalendarTimes } from "react-icons/fa";
import { IoIosEye } from "react-icons/io";
import { TiDownload } from "react-icons/ti";
import SaveMenu from "./SaveMenu";
import SettingsMenu from "./SettingsMenu";
import { plannerActions } from "../../../actions/plannerActions";

const OptionsHeader = ({ plannerRef, isAllEmpty }) => {
  const theme = useSelector((state) => state.theme);
  const { areYearsHidden } = useSelector((state) => state.planner);
  const { years } = useSelector((state) => state.planner);
  const dispatch = useDispatch();
  const unhideAll = () => {
    dispatch(plannerActions("UNHIDE_ALL_YEARS"));
  };
  const unscheduleAll = () => {
    dispatch(plannerActions("UNSCHEDULE_ALL"));
  };

  return (
    <div className="optionsHeader">
      <Tippy
        content={<SettingsMenu />}
        moveTransition="transform 0.2s ease-out"
        interactive
        trigger="click"
        theme={theme === "light" ? "light" : "dark"}
        zIndex={1}
        placement="bottom-start"
      >
        <div>
          <Tooltip title="Settings">
            <button className="settingsButton">
              <IoCogSharp className="settingsIcon" size="1.5em" />
            </button>
          </Tooltip>
        </div>
      </Tippy>

      {theme === "light" && (
        <Tippy
          content={<SaveMenu plannerRef={plannerRef} />}
          moveTransition="transform 0.2s ease-out"
          interactive
          trigger="click"
          theme={theme === "light" ? "light" : "dark"}
          zIndex={1}
          placement="bottom-start"
        >
          <div>
            <Tooltip title="Export">
              <button className="settingsButton">
                <TiDownload className="settingsIcon" size="1.5em" />
              </button>
            </Tooltip>
          </div>
        </Tippy>
      )}

      {!isAllEmpty(years) && (
        <Popconfirm
          placement="bottomRight"
          title="Are you sure you want to unplan all your courses?"
          onConfirm={unscheduleAll}
          style={{ width: "200px" }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Unplan all courses">
            <button className="settingsButton">
              <FaRegCalendarTimes size="1.5em" className="settingsIcon" />
            </button>
          </Tooltip>
        </Popconfirm>
      )}

      {areYearsHidden && (
        <Tooltip title="Show all hidden years">
          <button className="settingsButton" onClick={unhideAll}>
            <IoIosEye size="1.5em" className="settingsIcon" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default OptionsHeader;
