import React from "react";
import { Button, Tooltip } from "antd";
import { BugOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import useMediaQuery from "../../hooks/useMediaQuery";
import { FEEDBACK_LINK } from "../../constants";
import "./index.less";

const FeedbackButton = () => {
  const theme = useSelector((store) => store.theme);
  // Feedback form
  const isTablet = useMediaQuery("(max-width: 1000px)");
  const openFeedbackLink = () => {
    window.open(FEEDBACK_LINK, "_blank");
  };
  // Move this to the drawer if the screen is too small
  return (isTablet) ? <div />
    : (
      <div className="feedback-btn-cont-root">
        <Tooltip title="Report a bug!">
          <Button
            shape="circle"
            ghost={theme === "dark"}
            icon={<BugOutlined />}
            size="large"
            onClick={() => openFeedbackLink()}
          />
        </Tooltip>
      </div>
    );
};

export default FeedbackButton;
