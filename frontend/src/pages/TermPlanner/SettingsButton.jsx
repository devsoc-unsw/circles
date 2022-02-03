import React from "react";
import { useSelector } from "react-redux";
import { IoCogSharp } from "react-icons/io5";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import SettingsMenu from "./SettingsMenu";

const SettingsButton = () => {
  const theme = useSelector((state) => state.theme);

  const [isOpen, setIsOpen] = React.useState(false);

  return (
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
          size="1.2em"
          style={{ fontSize: "1.5em", color: "#303539" }}
        />
      </button>
    </Tippy>
  );
};

export default SettingsButton;
