import React, { useState } from "react";
import { Typography } from "antd";
import additionalOptionsGif from "assets/helpGifs/additional-options.gif";
import additionalOptionsPic from "assets/helpGifs/additional-options.jpg";
import dragAndDropGif from "assets/helpGifs/drag-and-drop.gif";
import dragAndDropPic from "assets/helpGifs/drag-and-drop.jpg";
import hideYearGif from "assets/helpGifs/hide-year.gif";
import hideYearPic from "assets/helpGifs/hide-year.jpg";
import unscheduleGif from "assets/helpGifs/unschedule.gif";
import unschedulePic from "assets/helpGifs/unschedule.jpg";
import CS from "../common/styles";
import S from "./styles";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const { Title } = Typography;

const HelpStep = ({
  title, gif, pic, altText,
}) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <CS.PopupEntry>
        <Title level={3} className="text settingsSubtitle">
          {title}
        </Title>
      </CS.PopupEntry>
      <S.HelpGif
        onMouseEnter={() => setPlaying(true)}
        onMouseLeave={() => setPlaying(false)}
        src={playing ? gif : pic}
        alt={altText}
      />
    </div>
  );
};

const HelpMenu = () => {
  const helpSteps = [
    {
      title: "1. Drag and Drop Courses",
      pic: dragAndDropPic,
      gif: dragAndDropGif,
      altText: "drag and drop walkthrough",
    },
    {
      title: "2. Right Click Courses for More Actions",
      pic: unschedulePic,
      gif: unscheduleGif,
      altText: "context menu walkthrough",
    },
    {
      title: "3. Hide Year",
      pic: hideYearPic,
      gif: hideYearGif,
      altText: "hide year walkthrough",
    },
    {
      title: "4. Additional Features",
      pic: additionalOptionsPic,
      gif: additionalOptionsGif,
      altText: "additional options walkthrough",
    },
  ];

  return (
    <S.HelpMenuWrapper>
      <S.HeaderWrapper>
        <Title level={2} strong className="text settingsTitle">
          Term Planner Tips (Hover to Play)
        </Title>
        <CS.MenuDivider />
      </S.HeaderWrapper>
      {helpSteps.map(({
        title, pic, gif, altText,
      }) => <HelpStep title={title} gif={gif} pic={pic} altText={altText} />)}
    </S.HelpMenuWrapper>
  );
};

export default HelpMenu;
