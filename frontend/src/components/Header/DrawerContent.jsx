import React from "react";
import { IoIosSunny, IoMdMoon } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BugOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { FEEDBACK_LINK, inDev } from "config/constants";
import { toggleTheme } from "reducers/themeSlice";

const DrawerContent = ({ onCloseDrawer }) => {
  const theme = useSelector((state) => state.theme);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePush = (url) => {
    navigate(url);
    onCloseDrawer();
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme(theme === "light" ? "dark" : "light"));
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
      {inDev && (
        <Menu.ItemGroup key="customisation" title="Customisation">
          <Menu.Item
            key="theme-toggle"
            onClick={() => handleThemeToggle()}
            icon={theme === "light" ? <IoMdMoon /> : <IoIosSunny />}
          >
            Change to {theme === "light" ? "dark" : "light"} theme
          </Menu.Item>
        </Menu.ItemGroup>
      )}
    </Menu>
  );
};

export default DrawerContent;
