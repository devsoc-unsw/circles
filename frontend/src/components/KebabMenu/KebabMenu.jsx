/* eslint-disable */

import React from "react";
import { useContextMenu } from "react-contexify";
import "./index.less";

const KebabMenuIcon = ({ code }) => {


  // TODO: delete
  // const onClick = (e) => {
  //   e.target.style.color = (e.target.style.color == "green") ? "black" : "green";
  //   return 0;
  // };

  const { show, hideAll } = useContextMenu({
    id: `${code}-context`,
  });

  // ? onClick Handled by caller
  const displayContextMenu = (e) => {
    e.stopPropagation();
    // TODO: remove debug
    // e.target.style.color = (e.target.style.color === "green") ? "black" : "green";
    // show(e);
  };

  // ? Should this have a query for light / dark mode?
  return (
    <svg
      className="KebabMenuIcon"
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
