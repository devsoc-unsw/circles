import React from "react";
import { useNavigate } from "react-router-dom";
import { BugOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { FEEDBACK_LINK, inDev } from "config/constants";
import routes from "./routes";

type Props = {
  onCloseDrawer: string
}

const DrawerContent = ({ onCloseDrawer }: Props) => {
  const navigate = useNavigate();

  const FEEDBACK_KEY = "feedback-link";

  const handleClick = (e) => {
    if (e.key === FEEDBACK_KEY) {
      window.open(FEEDBACK_LINK, "_blank");
    } else {
      navigate(e.key);
      onCloseDrawer();
    }
  };

  const items = routes
    .filter((route) => !route.dev || inDev) // filter out in dev features if not in dev mode
    .map((route) => ({
      label: route.label,
      key: route.link,
    }));

  items.push({ label: "Report a bug!", key: FEEDBACK_KEY, icon: <BugOutlined /> });

  return (
    <Menu mode="vertical" style={{ marginTop: "2em" }} onClick={handleClick} items={items} />
  );
};

export default DrawerContent;
