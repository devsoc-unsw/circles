import React, { useState } from "react";
import { Typography } from "antd";
import CS from "../common/styles";
import S from "./styles";

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
      pic: "/helpGifs/drag-and-drop.jpg",
      gif: "/helpGifs/drag-and-drop.gif",
      altText: "drag and drop walkthrough",
    },
    {
      title: "2. Right Click Courses for More Actions",
      pic: "/helpGifs/unschedule.jpg",
      gif: "/helpGifs/unschedule.gif",
      altText: "context menu walkthrough",
    },
    {
      title: "3. Hide Year",
      pic: "/helpGifs/hide-year.jpg",
      gif: "/helpGifs/hide-year.gif",
      altText: "hide year walkthrough",
    },
    {
      title: "4. Additional Features",
      pic: "/helpGifs/additional-options.jpg",
      gif: "/helpGifs/additional-options.gif",
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
