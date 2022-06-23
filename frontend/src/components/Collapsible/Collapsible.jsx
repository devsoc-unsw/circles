import React, { useState } from "react";
import { RightOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import "./index.less";

const { Title } = Typography;

const Collapsible = ({ initiallyCollapsed, title, children, headerStyle }) => { // eslint-disable-line
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={toggleCollapse} role="none" style={headerStyle}>
        <RightOutlined
          className={(isCollapsed)
            ? "collapsible-button collapsible-button-collapsed"
            : "collapsible-button"}
        />
        {(typeof title === "string" || title instanceof String)
          ? (
            <Title level={3} className="text">
              {title}
            </Title>
          ) : (
            title
          )}
      </div>
      <div className={isCollapsed ? "collapsible-content-collapsed" : "collapsible-content"}>
        {children}
      </div>
    </div>
  );
};

export default Collapsible;
