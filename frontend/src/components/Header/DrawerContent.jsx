import React from "react";
import { useNavigate } from "react-router-dom";
import { BugOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { FEEDBACK_LINK, inDev } from "config/constants";

const DrawerContent = ({ onCloseDrawer }) => {
  const navigate = useNavigate();

  const handlePush = (url) => {
    navigate(url);
    onCloseDrawer();
  };

  const openFeedbackLink = () => {
    window.open(FEEDBACK_LINK, "_blank");
    onCloseDrawer();
  };

  return (
    <Menu mode="vertical" style={{ marginTop: "2em" }}>
      <Menu.Item key="course-selector" onClick={() => handlePush("/course-selector")}>
        Course Selector
      </Menu.Item>
      {
        inDev && (
          <Menu.Item key="graphical-selector" onClick={() => handlePush("/graphical-selector")}>
            Graphical Selector
          </Menu.Item>
        )
      }
      <Menu.Item key="term-planner" onClick={() => handlePush("/term-planner")}>
        Term Planner
      </Menu.Item>
      {inDev && (
        <Menu.Item key="progression-checker" onClick={() => handlePush("/progression-checker")}>
          Progression Checker
        </Menu.Item>
      )}
      <Menu.Item key="feedback-link" icon={<BugOutlined />} onClick={openFeedbackLink}>
        Report a bug!
      </Menu.Item>
    </Menu>
  );
};

export default DrawerContent;
