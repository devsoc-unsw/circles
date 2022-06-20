import React, { useState } from "react";
import { Divider, Typography } from "antd";
import additionalOptionsGif from "assets/helpGifs/additional-options.gif";
import additionalOptionsPic from "assets/helpGifs/additional-options.jpg";
import dragAndDropGif from "assets/helpGifs/drag-and-drop.gif";
import dragAndDropPic from "assets/helpGifs/drag-and-drop.jpg";
import hideYearGif from "assets/helpGifs/hide-year.gif";
import hideYearPic from "assets/helpGifs/hide-year.jpg";
import unscheduleGif from "assets/helpGifs/unschedule.gif";
import unschedulePic from "assets/helpGifs/unschedule.jpg";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

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
          className="helpGif"
          onMouseEnter={() => { setDragAndDropPlaying(true); }}
          onMouseLeave={() => { setDragAndDropPlaying(false); }}
          src={dragAndDropPlaying ? dragAndDropGif : dragAndDropPic}
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
          className="helpGif"
          onMouseEnter={() => { setUnschedulePlaying(true); }}
          onMouseLeave={() => { setUnschedulePlaying(false); }}
          src={unschedulePlaying ? unscheduleGif : unschedulePic}
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
          className="helpGif"
          onMouseEnter={() => { setHideYearPlaying(true); }}
          onMouseLeave={() => { setHideYearPlaying(false); }}
          src={hideYearPlaying ? hideYearGif : hideYearPic}
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
          className="helpGif"
          onMouseEnter={() => { setAdditionalOptionsPlaying(true); }}
          onMouseLeave={() => { setAdditionalOptionsPlaying(false); }}
          src={additionalOptionsPlaying ? additionalOptionsGif : additionalOptionsPic}
          alt="additional options walkthrough"
        />
      </div>
    </div>
  );
};

export default HelpMenu;
