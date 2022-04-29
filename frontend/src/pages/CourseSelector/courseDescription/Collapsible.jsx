import React, { useState } from "react";
import { Typography } from "antd";
import { LeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Collapsible = ({ initiallyCollapsed, title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <div className="collapsible-header" onClick={toggleCollapse} role="none">
        <Title level={3} className="text">
          {title}
        </Title>
        <LeftOutlined
          className={(isCollapsed)
            ? "collapsible-button collapsible-button-collapsed"
            : "collapsible-button"}
        />
      </div>
      <div className={isCollapsed ? "collapsible-content-collapsed" : "collapsible-content"}>
        {children}
      </div>
    </>
  );
};

export default Collapsible;
