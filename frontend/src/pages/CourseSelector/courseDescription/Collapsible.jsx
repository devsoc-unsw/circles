import React from 'react';
import { Typography } from "antd";
const { Title } = Typography;

export const CollapsibleHeader = ({ isCollapsed, setIsCollapsed, text }) => {

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


const CollapsibleButton = ({ isCollapsed, setIsCollapsed }) => {
  const rotation = isCollapsed ? 0 : -90;
  
  const classes = 
  
  return (
    <div
		className={(isCollapsed) ? "collapsible-button collapsible-button-collapsed" : "collapsible-button"
	>
      <svg
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
	  >
	    <g
	      data-name="Layer
          2"><g
          data-name="arrow-left"><rect
          width="26"
          height="26"
          opacity="0"
		/>
        <path
			d="M13.54 18a2.06 2.06 0 0 1-1.3-.46l-5.1-4.21a1.7 1.7 0 0 1 0-2.66l5.1-4.21a2.1 2.1 0 0 1 2.21-.26 1.76 1.76 0 0 1 1.05 1.59v8.42a1.76 1.76 0 0 1-1.05 1.59 2.23 2.23 0 0 1-.91.2z"
        />
        </g></g>
      </svg>
    </div>
  )
}

