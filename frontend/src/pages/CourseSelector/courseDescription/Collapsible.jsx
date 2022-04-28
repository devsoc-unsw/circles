import React from 'react';
import { Typography } from "antd";
const { Title } = Typography;

// TODO: make required w/ props
export const CollapsibleHeader = ({ isCollapsed, setIsCollapsed, text }) => {

  console.log("arguments: ", isCollapsed, setIsCollapsed, text);

  const toggleCollapse = (e) => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="collapsible-header" onClick={toggleCollapse}>
      <Title level={3} className="text">
        {text}
      </Title>
      <CollapsibleButton isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> 
    </div>
    )
}


export const CollapsibleButton = ({ isCollapsed, setIsCollapsed }) => {
  const rotation = isCollapsed ? 0 : -90;
  
  const classes = (isCollapsed) ? "collapsible-button collapsible-button-collapsed" : "collapsible-button";
  
  return (
    <div
      className={classes}
    >
      ^-
      {isCollapsed ? "tRUE" : "FALSE"}
    </div>
  )
}


