import React, { useState } from "react";
import { Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "./Collapsible.less";

const { Title } = Typography;

const Collapsible = ({ initiallyCollapsed, title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <div className="collapsible-header" onClick={toggleCollapse} role="none">
        <RightOutlined
          className={(isCollapsed)
            ? "collapsible-button collapsible-button-collapsed"
            : "collapsible-button"}
        />
        <Title level={3} className="text">
          {title}
        </Title>
      </div>
      <div className={isCollapsed ? "collapsible-content-collapsed" : "collapsible-content"}>
        {children}
      </div>
    </>
  );
};

export default Collapsible;
