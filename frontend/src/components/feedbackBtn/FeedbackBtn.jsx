import React from "react";
import { Button, Tooltip } from "antd";
import { BugOutlined } from "@ant-design/icons";
import "./feedbackBtn.less";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useSelector } from "react-redux";

export const FeedbackBtn = () => {
  const theme = useSelector((store) => store.theme);
  // Feedback form
  const FORM_LINK = "https://forms.gle/b3b8CrZsz9h5sZ3v9";
  const isTablet = useMediaQuery("(max-width: 1000px)");
  const openFeedbackLink = () => {
    window.open(FORM_LINK, "_blank");
  };
  // Move this to the drawer if the screen is too small
  if (isTablet) return <></>;
  return (
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
