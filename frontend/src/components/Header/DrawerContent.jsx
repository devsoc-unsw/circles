import React from "react";
import { BugOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { FEEDBACK_LINK } from "../../constants";

const DrawerContent = ({ onCloseDrawer }) => {
  // const theme = useSelector(state => state.theme);
  const navigate = useNavigate();
  // const dispatch = useDispatch();
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
      <Menu.Item key="1" onClick={() => handlePush("/course-selector")}>
        Course Selector
      </Menu.Item>
      <Menu.Item key="3" onClick={() => handlePush("/term-planner")}>
        Term Planner
      </Menu.Item>
      {/* <Menu.Item key="2" onClick={() => handlePush("/progression-checker")}>
        Progression Checker
      </Menu.Item> */}
      <Menu.Item key="4" icon={<BugOutlined />} onClick={openFeedbackLink}>
        Report a bug!
      </Menu.Item>
      {/* <Menu.ItemGroup key="customisation" title="Customisation">
                <Menu.Item key="4"
                    onClick={() => handleThemeToggle()}
                    icon={theme === "light" ? <IoMdMoon/> : <IoIosSunny/> }
                >
                    Change to {theme === "light" ? "dark" : "light"} theme
                </Menu.Item>
            </Menu.ItemGroup> */}
    </Menu>
  );
};

export default DrawerContent;
