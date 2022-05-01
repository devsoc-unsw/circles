import React, { useState } from "react";
import { Typography, Divider } from "antd";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import dragAndDropGif from "../../../images/helpGifs/drag-and-drop.gif";
import dragAndDropPng from "../../../images/helpGifs/drag-and-drop.png";
import unscheduleGif from "../../../images/helpGifs/unschedule.gif";
import unschedulePng from "../../../images/helpGifs/unschedule.png";
import hideYearGif from "../../../images/helpGifs/hide-year.gif";
import hideYearPng from "../../../images/helpGifs/hide-year.png";
import additionalOptionsGif from "../../../images/helpGifs/additional-options.gif";
import additionalOptionsPng from "../../../images/helpGifs/additional-options.png";

const HelpMenu = () => {
  const [dragAndDropPlaying, setDragAndDropPlaying] = useState(false);
  const [unschedulePlaying, setUnschedulePlaying] = useState(false);
  const [hideYearPlaying, setHideYearPlaying] = useState(false);
  const [additionalOptionsPlaying, setAdditionalOptionsPlaying] = useState(false);
  const { Title } = Typography;

  return (
    <div className="helpMenu">
      <div className="helpTitleContainer">
        <Title level={2} strong className="text settingsTitle">
          Term Planner Tips (Hover to Play)
        </Title>
        <Divider className="settingsDivider" />
      </div>
      <div>
        <div className="settingsEntry">
          <Title level={3} className="text settingsSubtitle">
            1. Drag and Drop Courses
          </Title>
        </div>
        <img
          className={dragAndDropPlaying ? "helpGif shadow" : "helpGif"}
          onMouseEnter={() => { setDragAndDropPlaying(true); }}
          onMouseLeave={() => { setDragAndDropPlaying(false); }}
          src={dragAndDropPlaying ? dragAndDropGif : dragAndDropPng}
          alt="drag and drop walkthrough"
        />
      </div>
      <div>
        <div className="settingsEntry">
          <Title level={3} className="text settingsSubtitle">
            2. Right Click Courses for More Actions
          </Title>
        </div>
        <img
          className={unschedulePlaying ? "helpGif shadow" : "helpGif"}
          onMouseEnter={() => { setUnschedulePlaying(true); }}
          onMouseLeave={() => { setUnschedulePlaying(false); }}
          src={unschedulePlaying ? unscheduleGif : unschedulePng}
          alt="context menu walkthrough"
        />
      </div>
      <div>
        <div className="settingsEntry">
          <Title level={3} className="text settingsSubtitle">
            3. Hide Year
          </Title>
        </div>
        <img
          className={hideYearPlaying ? "helpGif shadow" : "helpGif"}
          onMouseEnter={() => { setHideYearPlaying(true); }}
          onMouseLeave={() => { setHideYearPlaying(false); }}
          src={hideYearPlaying ? hideYearGif : hideYearPng}
          alt="hide year walkthrough"
        />
      </div>
      <div>
        <div className="settingsEntry">
          <Title level={3} className="text settingsSubtitle">
            4. Additional Features
          </Title>
        </div>
        <img
          className={additionalOptionsPlaying ? "helpGif shadow" : "helpGif"}
          onMouseEnter={() => { setAdditionalOptionsPlaying(true); }}
          onMouseLeave={() => { setAdditionalOptionsPlaying(false); }}
          src={additionalOptionsPlaying ? additionalOptionsGif : additionalOptionsPng}
          alt="additional options walkthrough"
        />
      </div>
    </div>
  );
};

export default HelpMenu;
