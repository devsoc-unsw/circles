import React from "react";
import { useSelector } from "react-redux";
import { BugOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import Link from "next/link";
import { FEEDBACK_LINK } from "config/constants";
import useMediaQuery from "hooks/useMediaQuery";
import S from "./styles";

const FeedbackButton = () => {
  const theme = useSelector((store) => store.theme);
  // Feedback form
  const isTablet = useMediaQuery("(max-width: 1000px)");

  // Move this to the drawer if the screen is too small
  return (isTablet) ? <div />
    : (
      <S.FeedbackBtnWrapper>
        <Tooltip title="Report a bug!">
          <Link href={FEEDBACK_LINK} passHref>
            <Button
              shape="circle"
              ghost={theme === "dark"}
              icon={<BugOutlined />}
              size="large"
            />
          </Link>
        </Tooltip>
      </S.FeedbackBtnWrapper>
    );
};

export default FeedbackButton;
