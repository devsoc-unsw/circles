import React from "react";
import { Button, Tooltip } from "antd";
import { BugOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import "./feedbackBtn.less";
import useMediaQuery from "../../hooks/useMediaQuery";

export const FeedbackBtn = () => {
  const theme = useSelector((store) => store.theme);
  // Feedback form
  const FORM_LINK = "https://github.com/csesoc/Circles/issues?q=is%3Aissue+is%3Aopen";
  const isTablet = useMediaQuery("(max-width: 1000px)");
  const openFeedbackLink = () => {
    window.open(FORM_LINK, "_blank");
  };
  // Move this to the drawer if the screen is too small
  return (isTablet) ? <div />
    : (
      <div className="feedbackFab-root">
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

export default FeedbackBtn;
