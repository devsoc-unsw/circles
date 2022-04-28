import React from "react";
import { Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";

const { Title } = Typography;

const CollapsibleHeader = ({ isCollapsed, setIsCollapsed, text }) => {
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="collapsible-header" onClick={toggleCollapse} role="none">
      <Title level={3} className="text">
        {text}
      </Title>
      <RightOutlined
        className={(isCollapsed)
          ? "collapsible-button collapsible-button-collapsed"
          : "collapsible-button"}
      />
    </div>
  );
};

export default CollapsibleHeader;
