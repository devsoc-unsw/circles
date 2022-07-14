import React, { useState } from "react";
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

const HelpStep = ({
  title, gif, pic, altText,
}) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <CS.PopupEntry>
        <CS.MenuText>{title}</CS.MenuText>
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
        <CS.MenuHeader>Term Planner Tips (Hover to Play)</CS.MenuHeader>
        <CS.MenuDivider />
      </S.HeaderWrapper>
      {helpSteps.map(({
        title, pic, gif, altText,
      }) => <HelpStep title={title} gif={gif} pic={pic} altText={altText} />)}
    </S.HelpMenuWrapper>
  );
};

export default HelpMenu;
