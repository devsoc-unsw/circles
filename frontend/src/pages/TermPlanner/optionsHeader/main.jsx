import React from "react";
import { Tooltip, Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { IoCogSharp, IoWarning } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { FaRegCalendarTimes } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import { IoIosEye } from "react-icons/io";
import { TiDownload } from "react-icons/ti";
import SaveMenu from "./SaveMenu";
import SettingsMenu from "./SettingsMenu";
import HelpMenu from "./HelpMenu";
import { unhideAllYears, unscheduleAll } from "../../../reducers/plannerSlice";
import updateAllWarnings from "../ValidateTermPlanner";

const OptionsHeader = ({
  plannerRef, isAllEmpty, setSupress, supress,
}) => {
  const theme = useSelector((state) => state.theme);
  const { areYearsHidden } = useSelector((state) => state.planner);
  const { years, startYear, completedTerms } = useSelector((state) => state.planner);
  const { programCode, specialisation, minor } = useSelector(
    (state) => state.degree,
  );
  const dispatch = useDispatch();

  return (
    <div className="optionsHeader">
      <div className="leftButtons">
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
              <button type="button" className="settingsButton">
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
                <button type="button" className="settingsButton">
                  <TiDownload className="settingsIcon" size="1.5em" />
                </button>
              </Tooltip>
            </div>
          </Tippy>
        )}

        {!isAllEmpty(years) && (
          <div>
            <Popconfirm
              placement="bottomRight"
              title="Are you sure you want to unplan all your courses?"
              onConfirm={() => dispatch(unscheduleAll())}
              style={{ width: "200px" }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Unplan all courses">
                <button type="button" className="settingsButton">
                  <FaRegCalendarTimes size="1.5em" className="settingsIcon" />
                </button>
              </Tooltip>
            </Popconfirm>
          </div>
        )}

        {areYearsHidden && (
          <div>
            <Tooltip title="Show all hidden years">
              <button type="button" className="settingsButton" onClick={() => dispatch(unhideAllYears())}>
                <IoIosEye size="1.5em" className="settingsIcon" />
              </button>
            </Tooltip>
          </div>
        )}

        <div>
          <Tooltip title="Toggle warnings for previous terms">
            <button
              className={`settingsButton${supress ? " filled" : ""}`}
              type="button"
              onClick={() => {
                setSupress((prev) => !prev);
                updateAllWarnings(
                  dispatch,
                  { years, startYear, completedTerms },
                  { programCode, specialisation, minor },
                  supress,
                );
              }}
            >
              <IoWarning size="1.5em" />
            </button>
          </Tooltip>
        </div>
      </div>

      <Tippy
        content={<HelpMenu />}
        moveTransition="transform 0.2s ease-out"
        interactive="true"
        trigger="click"
        theme={theme === "light" ? "light" : "dark"}
        maxWidth="80vh"
        placement="bottom-start"
      >
        <div>
          <Tooltip title="Help">
            <button type="button" className="settingsButton helpButton">
              <FiHelpCircle className="settingsIcon" size="1.5em" />
            </button>
          </Tooltip>
        </div>
      </Tippy>
    </div>
  );
};

export default OptionsHeader;
