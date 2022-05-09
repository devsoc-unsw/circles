import React from "react";
import { useContextMenu } from "react-contexify";
import "./index.less";

const KebabMenuIcon = ({ code }) => {
  const onClick = (e) => {
    e.target.style.color = (e.target.style.color == "green") ? "black" : "green";
    return 0;
  };

  const { show, hideAll } = useContextMenu({
    id: `${code}-context`,
  });

  const displayContextMenu = (e) => {
    e.target.style.color = (e.target.style.color === "green") ? "black" : "green";
    show(e);
  };

  return (
    <svg
      className="KebabMenuIcon"
      onClick={displayContextMenu}
      onContextMenu={useContextMenu}
      width="20px"
      height="20px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="2.5" r=".75" />
      <circle cx="8" cy="8" r=".75" />
      <circle cx="8" cy="13.5" r=".75" />
    </svg>
  );
};

export default KebabMenuIcon;
